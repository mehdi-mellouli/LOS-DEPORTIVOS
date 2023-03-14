import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
  DeleteOutlined,
  CloseOutlined,
  EditOutlined,
  SaveOutlined
} from "@mui/icons-material";
import { Box, Divider, IconButton, Typography, InputBase, Dialog, DialogTitle, DialogContent, DialogActions, Button, useTheme } from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost, deletePost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments,
}) => {
  const [isComments, setIsComments] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(description);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;

  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  const delPost = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    const resp = await response.json();
    if (resp.status == 'OK') {
      dispatch(deletePost({ postId }));
    }
  };

  const putPost = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description: updatedDescription }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
    setIsEdit(false);
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      {!isEdit && (<Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>)}
      {isEdit && <InputBase
        placeholder="What's on your mind..."
        onChange={(e) => setUpdatedDescription(e.target.value)}
        value={updatedDescription}
        sx={{
          width: "100%",
          backgroundColor: palette.neutral.light,
          borderRadius: "1rem",
          padding: "0.5rem 1rem",
          marginTop: "1em"
        }}
      />}
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          {/*<FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments.length}</Typography>
          </FlexBetween>*/}
        </FlexBetween>

        <FlexBetween gap="0.3rem">
          {isEdit && description != updatedDescription && (<IconButton onClick={putPost}>
            <SaveOutlined />
          </IconButton>)}
          {loggedInUserId == postUserId && isEdit && (<IconButton onClick={() => { setIsEdit(false); setUpdatedDescription(description) }}>
            <CloseOutlined />
          </IconButton>)}
          {loggedInUserId == postUserId && !isEdit && (<IconButton onClick={() => setIsEdit(true)}>
            <EditOutlined />
          </IconButton>)}
          {loggedInUserId == postUserId && (<IconButton onClick={() => setIsDelete(true)}>
            <DeleteOutlined />
          </IconButton>)}
          {/*<IconButton>
            <ShareOutlined />
          </IconButton>*/}
        </FlexBetween>
      </FlexBetween>
      <Dialog
        open={isDelete}
        onClose={() => setIsDelete(false)}
        aria-labelledby="confirm-dialog"
      >
        <DialogTitle id="confirm-dialog">Delete post</DialogTitle>
        <DialogContent>Are you sure to delete this post?</DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDelete(false)}
          >
            Cancel
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              delPost();
              setIsDelete(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {isComments && (
        <Box mt="0.5rem">
          {comments.map((comment, i) => (
            <Box key={`${name}-${i}`}>
              <Divider />
              <Typography sx={{ color: main, m: "0.5rem 0", pl: "1rem" }}>
                {comment}
              </Typography>
            </Box>
          ))}
          <Divider />
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
