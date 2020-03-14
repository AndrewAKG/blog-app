import React from 'react';
import { ListItem, ListItemText, ListItemAvatar, ListItemSecondaryAction, Avatar, Typography, IconButton } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import DeleteIcon from '@material-ui/icons/Delete';

const CommentCell = ({ commentData, onDeleteClick, enableDelete }) => {
  const { content, commentOwnerUsername, createdAt } = commentData;
  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar>
          <AccountCircleIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={content}
        secondary={<Typography variant="subtitle2" color="textSecondary">
          {"By"} {commentOwnerUsername}
          {" on "}
          <time>
            {" "}
            {new Date(createdAt).toLocaleString()}

          </time>
        </Typography>}
      />
      { enableDelete && <ListItemSecondaryAction>
        <IconButton edge="end" onClick={onDeleteClick}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>}
    </ListItem>
  )
}

export default CommentCell;