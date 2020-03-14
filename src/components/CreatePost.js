import React from 'react';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { createPost } from '../graphql/mutations';
import { Grid, TextField, Button, Card, CardContent } from '@material-ui/core';

class CreatePost extends React.Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: ""
  }

  componentDidMount = async () => {
    await Auth.currentUserInfo()
      .then(user => {
        this.setState({ postOwnerId: user.attributes.sub, postOwnerUsername: user.username })
      })
  }

  handlePostChange = name => event => {
    this.setState({ [name]: event.target.value })
  }

  handleAddPost = async (event) => {
    event.preventDefault();

    const { postOwnerId, postOwnerUsername, postTitle, postBody } = this.state;
    const input = {
      postOwnerId,
      postOwnerUsername,
      postBody,
      postTitle,
      createdAt: new Date().toISOString()
    }

    await API.graphql(graphqlOperation(createPost, { input }));
    this.setState({ postTitle: "", postBody: "" });
  }

  render() {
    return (
      <Card raised style={{ margin: 16 }}>
        <CardContent>
          <h3>Write a new post</h3>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="text"
                label="Post Title"
                required
                variant="outlined"
                value={this.state.postTitle}
                onChange={this.handlePostChange('postTitle')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="text"
                rows="4"
                variant="outlined"
                multiline
                label="Post Content"
                required
                value={this.state.postBody}
                onChange={this.handlePostChange('postBody')}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  style={{
                    backgroundColor: '#FF9900',
                    color: 'white',
                    paddingLeft: '20px',
                    paddingRight: '20px'
                  }}
                  onClick={this.handleAddPost}
                >
                  Post
                </Button>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    )
  }
}

export default CreatePost;