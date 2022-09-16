const button = document.getElementById('button')
const toasts = document.getElementById('toasts')

const messages = [
'Message One',
'Message Two',
'Message Three',
'Message Four',
]

const types = {
  0: 'info', 
  1: 'success', 
  2: 'error'
};


if(button) {
  button.addEventListener('click', () => createNotification())
}

function createNotification(message = null, type = null, time = 5000) {
  const notif = document.createElement('div')

  if(typeof type == 'number') {
    type = types[type];
  } 
  else {
    type = (Object.values(types).includes(type)) ? type?.toLowerCase() : null;
  }
  
  notif.classList.add('toast')
  notif.classList.add(type ? type : getRandomType())
  notif.innerText = message ? message : getRandomMessage()
  toasts.appendChild(notif)
  setTimeout(() => {
  notif.remove()
  }, time)
}
function getRandomMessage() {
  return messages[Math.floor(Math.random() * messages.length)]
}
function getRandomType() {
  return types[Math.floor(Math.random() * types.length)]
}