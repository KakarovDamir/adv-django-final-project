import React from 'react';
import { Card, CardContent, Typography, CardMedia, Box, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CommentIcon from '@mui/icons-material/Comment';
import api from '../../api';

const PostList = ({ posts }) => {
  const handleLike = async (postId) => {
    try {
      await api.posts.like(postId);
      // Здесь нужно обновить состояние постов
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {posts.map((post) => (
        <Card key={post.id} sx={{ mb: 3 }}>
          {post.image && (
            <CardMedia
              component="img"
              height="300"
              image={post.image}
              alt={post.title}
            />
          )}
          <CardContent>
            <Typography variant="h5" component="div">
              {post.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              by {post.author.username}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {post.content}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <IconButton onClick={() => handleLike(post.id)}>
                <FavoriteIcon color={post.liked ? 'error' : 'inherit'} />
              </IconButton>
              <Typography variant="body2" sx={{ mr: 2 }}>
                {post.likes_count}
              </Typography>
              <IconButton>
                <CommentIcon />
              </IconButton>
              <Typography variant="body2">
                {post.comments_count}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default PostList;