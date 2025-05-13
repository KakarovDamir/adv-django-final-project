import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Avatar } from '@mui/material';
import api from '../api';

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.profiles.get(username);
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box display="flex" alignItems="center" mt={4} mb={4}>
        <Avatar
          src={profile.avatar}
          alt={profile.username}
          sx={{ width: 100, height: 100, mr: 3 }}
        />
        <Box>
          <Typography variant="h4" component="h1">
            {profile.username}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {profile.bio || 'No bio yet'}
          </Typography>
          <Typography variant="body2">
            {profile.friends_count} friends
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Profile;