import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Forum as ForumIcon,
  Event as EventIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <Typography variant="h4" component="div">
          {value}
        </Typography>
      )}
    </CardContent>
  </Card>
);

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    channels: 0,
    events: 0,
    roles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // TODO: Implement API calls to fetch statistics
        const response = await fetch('/api/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.users}
            icon={<PeopleIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Channels"
            value={stats.channels}
            icon={<ForumIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Events"
            value={stats.events}
            icon={<EventIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Roles"
            value={stats.roles}
            icon={<BadgeIcon color="primary" />}
            loading={loading}
          />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            {/* TODO: Add activity feed component */}
            <Typography variant="body2" color="text.secondary">
              No recent activity to display
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;