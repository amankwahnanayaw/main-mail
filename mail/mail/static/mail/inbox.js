document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // submit handler
  document.querySelector("#compose-form").addEventListener("submit", send_email)

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-detail-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

// get emails for mailbox and user
fetch(`/emails/${mailbox}`)
.then(response => response.json())
.then(emails => {
    // loop throuhg emails and create a div for each
    emails.forEach(singleEmail => {
      
      console.log(singleEmail);

    //creat a div for each email
      const newEmail = document.createElement('div');
      newEmail.className = "list-group-item";
      newEmail.innerHTML = `
      <h6>Sender: ${singleEmail.sender}</h6>
      <h5>Subject: ${singleEmail.subject}</h5>
      <p>${singleEmail.timestamp}</p>
      `;
    // change background color
      newEmail.className = singleEmail.read ? 'read': 'unread';
    
    // Add event to view eamil
      newEmail.addEventListener('click', function() {
        email_view(singleEmail.id)
      });
      document.querySelector('#emails-view').append(newEmail);
    });

    // ... do something else with emails ...
});
}

// view a particular email by id
function email_view(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#email-detail-view').style.display = 'block';


      document.querySelector('#email-detail-view').innerHTML = `
      <ul class="list-group">
        <li class="list-group-item"><strong>From:</strong> ${email.semder}</li>
        <li class="list-group-item"><strong>To:</strong> ${email.recipients}</li>
        <li class="list-group-item"><strong>Subject:</strong> ${email.subject}</li>
        <li class="list-group-item"><strong>Timestamp:</strong> ${email.timestamp}</li>
        <li class="list-group-item">${email.body}</li>
      </ul>
      `

      // change to read
      if (!email.read){
        fetch(`/emails/${email.id}`), {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        }
      }

      //Archive/Unarchive logic
      const btn_arch = document.createElement('button');
      btn_arch.innerHTML = email.archive ? "Unarchive" : "Archive";
      btn_arch.className = email.archive ? "btn btn-success" : "btn btn-danger";
      btn_arch.addEventListener('click', function() {
        fetch(`/email/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived : !email.archived
          })
        })
        .then(() => {load_mailbox('archive')})
      });
      document.querySelector('#email-detail-view').append(btn_arch);


      //Reply button logic
      const btn_reply = document.createElement('button');
      btn_reply.innerHTML = "Reply";
      btn_reply.className = "btn btn-info";
      btn_reply.addEventListener('click', function() {
        console.log("Reply");
      });
      document.querySelector('#email-detail-view').append(btn_reply);
  });
}


function send_email(event){
  event.preventDefault();


// store mails fields
  const recipients = document.querySelector("#compose-recipients").value;
  const subject = document.querySelector("#compose-subject").value;
  const body = document.querySelector("#compose-body").value;


// send data to backend
fetch('/emails', {
  method: 'POST',
  body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
  })
})
.then(response => response.json())
.then(result => {
    // Print result
    console.log(result);
    load_mailbox('sent')
});
}
