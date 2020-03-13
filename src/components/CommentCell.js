import React from 'react'

const CommentCell = ({ commentData }) => {
  const { content, commentOwnerUsername, createdAt } = commentData;
  return (
    <div className="comment">
      <span style={{ fontStyle: "italic", color: "blue" }}>
        {"Commment by: "} {commentOwnerUsername}
        {" on "}
        <time style={{ fontStyle: "italic" }}>
          {" "}
          {new Date(createdAt).toDateString()}

        </time>
      </span>
      <p> {content}</p>
    </div>
  )
}

export default CommentCell;