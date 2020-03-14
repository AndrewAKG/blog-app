import React from 'react';
import './App.css';
import DisplayPosts from './components/DisplayPosts';
import CreatePost from './components/CreatePost';
import { withAuthenticator } from 'aws-amplify-react';
import { AppBar, Toolbar, Typography, Grid } from '@material-ui/core';

function App() {
  const web = window.innerWidth > 700 ? true : false;
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <Typography variant="h6" >
              Blog News Feed
          </Typography>
          </div>
        </Toolbar>
      </AppBar>
      <div className="App">
        <Grid container justify="center">
          {web && <Grid item xs={3} />}
          <Grid item xs={web ? 6 : 12}>
            <CreatePost />
            <DisplayPosts />
          </Grid>
          {web && <Grid item xs={3} />}
        </Grid>
      </div>
    </div>
  );
}

export default withAuthenticator(App, true);