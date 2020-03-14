import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid,
  TextField,
  IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { updatePost } from '../graphql/mutations';

class EditPost extends React.Component {
  state = {
    showModal: false,
    id: this.props.id,
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: this.props.postTitle,
    postBody: this.props.postBody
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

  handleEditPost = () => {
    this.setState({ showModal: !this.state.showModal });
  }

  handleEditSubmit = async () => {
    const { id, postOwnerId, postOwnerUsername, postTitle, postBody } = this.state;
    const input = {
      id,
      postOwnerId,
      postOwnerUsername,
      postBody,
      postTitle
    }

    await API.graphql(graphqlOperation(updatePost, { input }));
    this.setState({ showModal: false });
  }

  render() {
    return (
      <React.Fragment>
        <Dialog onClose={() => this.setState({ showModal: false })} maxWidth="sm" fullWidth open={this.state.showModal}>
          <DialogTitle id="simple-dialog-title">Edit Post</DialogTitle>
          <DialogContent>
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
                  cols="40"
                  variant="outlined"
                  multiline
                  label="New Blog Post"
                  required
                  value={this.state.postBody}
                  onChange={this.handlePostChange('postBody')}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.setState({ showModal: false })}>
              Cancel
            </Button>
            <Button onClick={this.handleEditSubmit} style={{
              backgroundColor: '#FF9900',
              color: 'white',
              paddingLeft: '20px',
              paddingRight: '20px'
            }}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <IconButton onClick={this.handleEditPost}><EditIcon /></IconButton>
      </React.Fragment>
    )
  }
}

export default EditPost;