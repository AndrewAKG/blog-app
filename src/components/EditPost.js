import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@material-ui/core';
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

  handlePostChange = event => {
    this.setState({ [event.target.name]: event.target.value })
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
        <Dialog onClose={() => this.setState({ showModal: false })} aria-labelledby="simple-dialog-title" open={this.state.showModal}>
          <DialogTitle id="simple-dialog-title">Edit Post</DialogTitle>
          <DialogContent>
            <form className="add-post">
              <input
                style={{ font: '19px' }}
                type="text"
                name="postTitle"
                placeholder="Post Title"
                required
                value={this.state.postTitle}
                onChange={this.handlePostChange}
              />

              <textarea
                type="text"
                name="postBody"
                rows="3"
                cols="40"
                placeholder="New Blog Post"
                required
                value={this.state.postBody}
                onChange={this.handlePostChange}
              />
            </form>
          </DialogContent>
          <DialogActions>
            <button onClick={() => this.setState({ showModal: false })}>
              Cancel
              </button>
            <button type="submit" onClick={this.handleEditSubmit}>
              Submit
              </button>
          </DialogActions>
        </Dialog>
        <button onClick={this.handleEditPost}>Edit</button>
      </React.Fragment>
    )
  }
}

export default EditPost;