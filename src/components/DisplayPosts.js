import React, { Component } from 'react';
import { listPosts } from '../graphql/queries';
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment } from '../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../graphql/mutations';
import EditPost from './EditPost';
import CreateComment from './CreateComment';
import CommentCell from './CommentCell';
import {
  Grid,
  Card,
  Typography,
  CardContent,
  IconButton,
  List,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails
} from '@material-ui/core';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

class DisplayPosts extends Component {
  state = {
    posts: []
  }

  componentDidMount = async () => {
    this.getPosts();

    this.createPostListener = API.graphql(graphqlOperation(onCreatePost))
      .subscribe({
        next: postData => {
          const newPost = postData.value.data.onCreatePost;
          const prevPosts = this.state.posts;
          const updatedPosts = [newPost, ...prevPosts];
          this.setState({ posts: updatedPosts });
        }
      });

    this.updatePostListener = API.graphql(graphqlOperation(onUpdatePost))
      .subscribe({
        next: postData => {
          const prevPosts = [...this.state.posts];
          const updatedPost = postData.value.data.onUpdatePost;
          const index = prevPosts.findIndex(post => post.id === updatedPost.id);
          prevPosts[index] = updatedPost;
          this.setState({ posts: prevPosts });
        }
      });

    this.deletePostListener = API.graphql(graphqlOperation(onDeletePost))
      .subscribe({
        next: postData => {
          const deletedPost = postData.value.data.onDeletePost;
          const updatedPosts = this.state.posts.filter(post => post.id !== deletedPost.id);
          this.setState({ posts: updatedPosts });
        }
      });

    this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment))
      .subscribe({
        next: commentData => {
          const createdComment = commentData.value.data.onCreateComment;
          let posts = [...this.state.posts];

          for (let post of posts) {
            if (createdComment.post.id === post.id) {
              post.comments.items.push(createdComment);
            }
          }
          this.setState({ posts });
        }
      })
  }

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
  }

  handleDeletePost = async (id) => {
    const input = { id };
    await API.graphql(graphqlOperation(deletePost, { input }));
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    this.setState({ posts: result.data.listPosts.items });
  }

  render() {
    return (
      <React.Fragment>
        <div>
          {this.state.posts.map(post => (
            <Card raised key={post.id} style={{ margin: 16 }}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{post.postTitle}</Typography>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    <EditPost
                      {...post}
                    />
                    <IconButton onClick={() => this.handleDeletePost(post.id)}>
                      <DeleteForeverIcon />
                    </IconButton>
                  </div>
                </div>
                <Typography variant="subtitle2" color="textSecondary" component="p">
                  {"Wrote By "} {post.postOwnerUsername}
                  {" on "}
                  <time> {new Date(post.createdAt).toLocaleString()}</time>
                </Typography>
                <Typography variant="body1" component="p" style={{ marginTop: 10, marginBottom: 32 }}>
                  {post.postBody}
                </Typography>

                <ExpansionPanel TransitionProps={{ unmountOnExit: true }} style={{ boxShadow: 'none'}}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Comments</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <CreateComment postId={post.id} />
                      </Grid>
                      <Grid item xs={12}>
                        <List >
                          {
                            post.comments.items.map((comment, index) => <CommentCell key={index} commentData={comment} />)
                          }
                        </List>
                      </Grid>
                    </Grid>
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </CardContent>
            </Card>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export default DisplayPosts;