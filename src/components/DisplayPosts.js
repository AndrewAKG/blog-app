import React, { Component } from 'react';
import { listPosts } from '../graphql/queries';
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment, onCreateLike, onDeleteLike, onDeleteComment } from '../graphql/subscriptions';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { createLike, deletePost, deleteLike, deleteComment } from '../graphql/mutations';
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
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

class DisplayPosts extends Component {
  state = {
    posts: [],
    ownerId: "",
    ownerUsername: "",
    isHovering: false,
    postLikedBy: []
  }

  componentDidMount = async () => {
    this.getPosts();
    await Auth.currentUserInfo()
      .then(user => {
        this.setState({ ownerId: user.attributes.sub, ownerUsername: user.username });
      })

    this.createPostListener = API.graphql(graphqlOperation(onCreatePost))
      .subscribe({
        next: postData => {
          const newPost = postData.value.data.onCreatePost;
          const prevPosts = this.state.posts.filter(post => post.id !== newPost.id);
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
      });

    this.deletePostCommentListener = API.graphql(graphqlOperation(onDeleteComment))
      .subscribe({
        next: commentData => {
          const deletedComment = commentData.value.data.onDeleteComment;
          let posts = [...this.state.posts];
          for (let post of posts) {
            if (deletedComment.post.id === post.id) {
              let newComments = post.comments.items.filter(item => item.id !== deletedComment.id);
              post.comments.items = newComments;
            }
          }
          this.setState({ posts });
        }
      });

    this.createPostLikeListener = API.graphql(graphqlOperation(onCreateLike))
      .subscribe({
        next: likeData => {
          const createdLike = likeData.value.data.onCreateLike;
          let posts = [...this.state.posts];
          for (let post of posts) {
            if (createdLike.post.id === post.id) {
              post.likes.items.push(createdLike);
            }
          }
          this.setState({ posts });
        }
      });

    this.deletePostLikeListener = API.graphql(graphqlOperation(onDeleteLike))
      .subscribe({
        next: likeData => {
          const deletedLike = likeData.value.data.onDeleteLike;
          let posts = [...this.state.posts];
          for (let post of posts) {
            if (deletedLike.post.id === post.id) {
              let newLikes = post.likes.items.filter(item => item.id !== deletedLike.id);
              post.likes.items = newLikes;
            }
          }
          this.setState({ posts });
        }
      });
  }

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
    this.deletePostCommentListener.unsubscribe();
    this.createPostLikeListener.unsubscribe();
    this.deletePostLikeListener.unsubscribe();
  }

  handleDeletePost = async (id) => {
    const input = { id };
    await API.graphql(graphqlOperation(deletePost, { input }));
  }

  handleDeleteComment = async (id) => {
    const input = { id };
    await API.graphql(graphqlOperation(deleteComment, { input }));
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    this.setState({ posts: result.data.listPosts.items });
  }

  likedPost = (postId) => {
    for (let post of this.state.posts) {
      if (post.id === postId) {
        for (let like of post.likes.items) {
          if (like.likeOwnerId === this.state.ownerId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  findMyLikeId = (postId) => {
    for (let post of this.state.posts) {
      if (post.id === postId) {
        for (let like of post.likes.items) {
          if (like.likeOwnerId === this.state.ownerId) {
            return like.id;
          }
        }
      }
    }
    return null;
  }

  handleLike = async (postId) => {
    if (this.likedPost(postId)) {
      const input = {
        id: this.findMyLikeId(postId)
      };

      try {
        await API.graphql(graphqlOperation(deleteLike, { input }));
      } catch (error) {
        console.error(error);
      }
    }
    else {
      const input = {
        numberLikes: 1,
        likeOwnerId: this.state.ownerId,
        likeOwnerUsername: this.state.ownerUsername,
        likePostId: postId
      };

      try {
        const result = await API.graphql(graphqlOperation(createLike, { input }));
      } catch (error) {
        console.error(error);
      }
    }
  }

  render() {
    const loggedInUserId = this.state.ownerId;
    return (
      <React.Fragment>
        <div>
          {this.state.posts.map(post => (
            <Card raised key={post.id} style={{ margin: 16 }}>
              <CardContent>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h5">{post.postTitle}</Typography>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {post.postOwnerId === loggedInUserId &&
                      <EditPost
                        {...post}
                      />
                    }
                    {post.postOwnerId === loggedInUserId &&
                      <IconButton onClick={() => this.handleDeletePost(post.id)}>
                        <DeleteForeverIcon />
                      </IconButton>
                    }
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

                <Typography variant="body1" component="p" style={{ marginBottom: 10 }}>
                  <IconButton onClick={() => this.handleLike(post.id)}>
                    <ThumbUpIcon color={this.likedPost(post.id) ? "primary" : "disabled"} />
                  </IconButton>
                  {post.likes.items.length}
                </Typography>

                <ExpansionPanel TransitionProps={{ unmountOnExit: true }} style={{ boxShadow: 'none' }}>
                  <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon />}
                  >
                    <Typography>Comments  ({post.comments.items.length})</Typography>
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails>
                    <Grid container spacing={1}>
                      <Grid item xs={12}>
                        <CreateComment postId={post.id} />
                      </Grid>
                      <Grid item xs={12}>
                        <List >
                          {
                            post.comments.items.map((comment, index) => (
                              <CommentCell
                                key={index}
                                commentData={comment}
                                enableDelete={comment.commentOwnerId === this.state.ownerId}
                                onDeleteClick={() => this.handleDeleteComment(comment.id)}
                              />
                            ))
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