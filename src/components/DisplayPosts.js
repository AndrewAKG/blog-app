import React, { Component } from 'react';
import { listPosts } from '../graphql/queries';
import { onCreatePost, onDeletePost, onUpdatePost, onCreateComment } from '../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';
import { deletePost } from '../graphql/mutations';
import EditPost from './EditPost';
import CreateComment from './CreateComment';
import CommentCell from './CommentCell';

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
            <div key={post.id} className="posts" style={rowStyle}>
              <h1>{post.postTitle}</h1>
              <span style={{ fontStyle: "italic", color: "blue" }}>
                {"Wrote By "} {post.postOwnerUsername}
                {" on "}
                <time style={{ fontStyle: "italic" }}> {new Date(post.createdAt).toDateString()}</time>
              </span>
              <p>{post.postBody}</p>
              <br />
              <span>
                <button onClick={() => this.handleDeletePost(post.id)}>
                  Delete
                </button>
                <EditPost
                  {...post}
                />
              </span>
              <span>
                <CreateComment postId={post.id}/>
                {post.comments.items.length > 0 && <span style={{ fontSize: "19px", color: "gray" }}>
                  Comments: </span>}
                {
                  post.comments.items.map((comment, index) => <CommentCell key={index} commentData={comment} />)
                }
              </span>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

const rowStyle = {
  background: '#f4f4f4',
  padding: '10px',
  border: '1px #ccc dotted',
  margin: '14px'
}

export default DisplayPosts;