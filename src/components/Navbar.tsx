// src/components/Navbar.tsx

import React, { useState } from 'react';
import { Toolbar, Typography, Button, Box, Paper, useMediaQuery, useTheme, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

// --- REMOVED 'ABOUT' ITEM FROM THE ARRAY ---
// src/components/Navbar.tsx
// ... (imports are the same)

// --- ADDED NEW 'COMPARE' ITEM TO THE ARRAY ---
const navItems = [
  { text: 'Home', path: '/' },
  { text: 'Visualize', path: '/visualizer' },
  { text: 'Compare', path: '/compare' }, // <-- ADD THIS LINE
  { text: 'Pseudo Code', path: '/pseudo-code' },
  { text: 'Project Of', path: '/project-of' },
];

const Navbar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navLinkStyle = { textDecoration: 'none', color: 'white', margin: '0 8px' };
  const activeLinkStyle = { textDecoration: 'underline', textUnderlineOffset: '4px' };

  const MobileMenu = (
    <>
      <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={() => setDrawerOpen(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)} onKeyDown={() => setDrawerOpen(false)}>
          <List>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton component={NavLink} to={item.path}>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );

  const DesktopMenu = (
    <Box>
      {navItems.map((item) => (
         <NavLink key={item.text} to={item.path} style={({ isActive }) => ({ ...navLinkStyle, ...(isActive ? activeLinkStyle : {}) })}>
            <Button color="inherit">{item.text}</Button>
         </NavLink>
      ))}
    </Box>
  );

  return (
    <Paper elevation={4} sx={{ borderRadius: '16px', bgcolor: 'primary.main', color: 'white' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CNF-SAT Visualizer
        </Typography>
        {isMobile ? MobileMenu : DesktopMenu}
      </Toolbar>
    </Paper>
  );
};

export default Navbar;