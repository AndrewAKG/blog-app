import React from 'react';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { createComment } from '../graphql/mutations';
import { Grid, TextField, Button } from '@material-ui/core';

class CreateComment extends React.Component {
  state = {
    commentOwnerId: "",
    commentOwnerUsername: "",
    content: ""
  };

  componentDidMount = async () => {
    await Auth.currentUserInfo()
      .then(user => {
        this.setState({
          commentOwnerId: user.attributes.sub,
          commentOwnerUsername: user.username
        })
      })
  };

  handleChangeContent = event => this.setState({ content: event.target.value });

  addComment = async () => {
    const input = {
      commentPostId: this.props.postId,
      commentOwnerId: this.state.commentOwnerId,
      commentOwnerUsername: this.state.commentOwnerUsername,
      content: this.state.content,
      createdAt: new Date().toISOString()
    };
    await API.graphql(graphqlOperation(createComment, { input }));

    this.setState({ content: "" }); // clear field
  }

  handleAddComment = async event => {
    event.preventDefault();
    await this.addComment();
  };

  handleKeyPress = async e => {
    if (e.key === 'Enter' && this.state.content) {
      e.preventDefault();
      await this.addComment();
    }
  }

  render() {
    const mobile = window.innerWidth < 700;
    return (
      <React.Fragment>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              type="text"
              rowsMax="4"
              variant="outlined"
              multiline
              placeholder="Write a comment..."
              required
              value={this.state.content}
              onChange={this.handleChangeContent}
              onKeyPress={(e) => this.handleKeyPress(e)}
            />
          </Grid>
          {mobile && <Grid item xs={12}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                style={{
                  backgroundColor: '#FF9900',
                  color: 'white',
                  paddingLeft: '20px',
                  paddingRight: '20px'
                }}
                onClick={this.handleAddComment}
              >
                Comment
              </Button>
            </div>
          </Grid>}
        </Grid>
      </React.Fragment>
    )
  }
}

export default CreateComment;