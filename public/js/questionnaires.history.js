/* global $ */

(function () {
  'use strict'
  $('.history').each(function (i, el) {
    $(el).click(function (e) {
      var QUID = $(e.target).closest('.history').attr('id')

      if (e.target.classList.contains('share')) {
        if (!e.target.disabled) {
          $.post('/share/' + QUID)
            .done(function (result) {
              e.target.innerHTML = result.success ? 'Sent' : 'Failed'
            })
            .fail(function () {
              e.target.innerHTML = 'Failed'
            })
            .always(function () {
              e.target.style.opacity = 0.5
              e.target.disabled = true
            })
        }

      } else {
        location.href = '/questionnaires/' + QUID + '/summary'

      }
    })
  })
})()
