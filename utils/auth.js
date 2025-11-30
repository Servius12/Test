async function checkUserRegistration() {
  try {
    const authUser = sessionStorage.getItem('authenticated_user');
    if (authUser) {
      const user = JSON.parse(authUser);
      return { 
        registered: true, 
        approved: true, 
        role: user.role,
        userId: user.userId
      };
    }
    return { registered: false, approved: false };
  } catch (error) {
    console.error('Error checking registration:', error);
    return { registered: false, approved: false };
  }
}

function logout() {
  sessionStorage.removeItem('authenticated_user');
  window.location.href = 'login.html';
}
