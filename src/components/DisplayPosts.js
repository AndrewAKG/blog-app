import React, { Component } from 'react';
import { listPosts } from '../graphql/queries';
import { onCreatePost } from '../graphql/subscriptions';
import { API, graphqlOperation } from 'aws-amplify';

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
      })
  }

  componentWillUnmount(){
    this.createPostListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));
    this.setState({ posts: result.data.listPosts.items })
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
                <button>
                  Delete
                </button>
                <button>
                  Edit
                </button>
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