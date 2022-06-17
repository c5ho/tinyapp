//CHECK FOR EMAIL (Helper function that checks for email in the user database and returns true if found)
const getUserByEmail = function(email, users) {
  for (let user_id in users) {
    if (users[user_id].email === email) {
      return user_id;
    }
  }
}

module.exports = { getUserByEmail };