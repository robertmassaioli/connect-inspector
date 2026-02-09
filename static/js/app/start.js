define(function() {
   AJS.$('.create-addon').click(function() {
      var createRequest = AJS.$.ajax({
         url: '/addon',
         type: 'POST',
         cache: false
      });

      createRequest.done(function(data) {
         console.log(data);
         if(data.addonKey) {
            window.location.href = '/page/addon?addonKey=' + data.addonKey;
         } else {
            // TODO handle the error
         }
      });

      createRequest.fail(function() {
         // TODO handle the error
      });
   });
});
