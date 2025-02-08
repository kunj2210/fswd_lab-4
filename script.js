const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;
const usersFilePath = path.join(__dirname, 'users.json');

// Helper function to read users from the file
const readUsers = async () => {
  const data = await fs.readFile(usersFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write users to the file
const writeUsers = async (users) => {
  await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

// Create HTTP server
const server = http.createServer(async (req, res) => {
  // Set response headers
  res.setHeader('Content-Type', 'application/json');

  // Handle GET /users
  if (req.method === 'GET' && req.url === '/users') {
    try {
      const users = await readUsers();
      res.statusCode = 200;
      res.end(JSON.stringify(users));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to read users' }));
    }
  }

  // Handle POST /users
  else if (req.method === 'POST' && req.url === '/users') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const newUser = JSON.parse(body);
        const users = await readUsers();

        // Generate a new ID
        newUser.id = users.length ? users[users.length - 1].id + 1 : 1;
        users.push(newUser);

        await writeUsers(users);
        res.statusCode = 201;
        res.end(JSON.stringify(newUser));
      } catch (error) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid user data' }));
      }
    });
  }

  // Handle DELETE /users/:id
  else if (req.method === 'DELETE' && req.url.startsWith('/users/')) {
    try {
      const userId = parseInt(req.url.split('/')[2]);
      const users = await readUsers();
      const updatedUsers = users.filter((user) => user.id !== userId);

      if (users.length === updatedUsers.length) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'User not found' }));
      } else {
        await writeUsers(updatedUsers);
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'User deleted successfully' }));
      }
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to delete user' }));
    }
  }

  // Handle invalid routes
  else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});