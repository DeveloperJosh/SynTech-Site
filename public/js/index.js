function logout() {
    window.location.href = "/user/logout";
  }
  function delete_account_button() {
    // using delete request to delete the account
    if (confirm("Are you sure you want to delete your account?")) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        window.location.href = "/";
      }
    };
    xhttp.open("DELETE", "/user/delete", true);
    xhttp.send();
    window.location.href = "/";
  } else {  
    return;
     }
    }

  function new_password() {
    window.location.href = "/user/forget";
  }

  function getEmail() {
    // get email from /info
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("email").innerHTML = this.responseText;
      }
    };
    xhttp.open("GET", "/getemail", true);
    xhttp.send();
  }
  function getUsername() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        document.getElementById("username").innerHTML = this.responseText;
      }
    };
    xhttp.open("GET", "/username", true);
    xhttp.send();
  }

  function is_verified() {
//// send a div with class banner if the user is not verified
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            if (this.responseText == "false") {
                document.getElementById("verified").innerHTML = "<div class=\"banner\">You are not verified. Please check your email for a verification link.</div>";
            }
        }
        }
    xhttp.open("GET", "/verified", true);
    xhttp.send();
  }

  function admin() {
    window.location.href = "/admin";
  }

  function is_admin_user() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        if (this.responseText == "true") {
          document.getElementById("admin").innerHTML = "<button class=\"btn btn-info\" onclick=\"admin()\">Admin Panel</button>";
        }
      }
    }
    xhttp.open("GET", "/admin_user", true);
    xhttp.send();
  }