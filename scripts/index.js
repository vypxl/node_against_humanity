$(() => {
  $('#join').click(() => {
    window.location.href = window.location.protocol + "//" +  window.location.host + "/game?name=" + $('#name').val()
  })
})
