import React from 'react';
import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography } from '@material-ui/core';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

const CommentCell = ({ commentData }) => {
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
      {/* <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="delete">
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction> */}
    </ListItem>
  )
}

export default CommentCell;