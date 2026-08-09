const jwt = require('jsonwebtoken');
// Use Yashod's user account ID (who lives in the Rathgama route area - postal 80260)
const token = jwt.sign({ id: '6a776f61050f7347cebad29c', role: 'user' }, 'cleantrack_secret_key_2026', { expiresIn: '30d' });

fetch('http://localhost:5000/api/user/schedule', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(res => res.json())
.then(data => {
  console.log('Full response:', JSON.stringify(data, null, 2));
})
.catch(err => console.error(err));
