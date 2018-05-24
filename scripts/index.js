$(() => {
  $('#join').click(() => {
    window.location.href = window.location.protocol + "//" +  window.location.host + "/game?name=" + $('#name').val()
  })

  document.addEventListener("keydown", evt => {
      if(evt.code == "Enter") 
        window.location.href = window.location.protocol + "//" +  window.location.host + "/game?name=" + $('#name').val()
    })

})
