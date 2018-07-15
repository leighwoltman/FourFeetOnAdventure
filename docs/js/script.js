$(document).ready(function(){

  $('#subscribeHeaderButton').click( function(e) {
    e.preventDefault();
    $('#exampleInputEmail1').focus();
    $('html, body').stop().animate({
        scrollTop: $('#exampleInputEmail1').offset().top
    }, 1500, 'easeInOutExpo');
  });

  $('#contactHeaderButton').click( function(e) {
    e.preventDefault();
    // clear the fields
    $('#sEmail').val("");
    $('#sComment').val("");
    $('#contactFailAlert').hide();
    $('#contactSuccessAlert').hide();
    $('#contactSpinner').hide();
    $('#contactSendButton').removeAttr('disabled');
    $('#contactSendButton').show();
    $("#myContactModal").modal({
      backdrop: 'static'
    });
  });

  $('#contactSendButton').click( function(e) {
    // hide any existing errors
    $('#contactFailAlert').hide();
    $('#contactSpinner').show();
    $('#contactSendButton').attr('disabled', 'disabled');

    var parameters = {};
    parameters.sEmail = $('#sEmail').val();
    parameters.sComment = $('#sComment').val();

    // start the ajax request to the server
    $.ajax({
          url: 'contact',
          type: 'POST',
          data: parameters,
          dataType: 'json',
          success: function(data) {
            $('#contactSendButton').hide();
            $('#contactSpinner').hide();
            $('#contactSuccessAlert').show();
            setTimeout(function() {
              $("#myContactModal").modal('hide'); 
            }, 3000);
          },
          error: function() {
            $('#contactSendButton').removeAttr('disabled');
            $('#contactSpinner').hide();
            $('#contactFailAlert').show();
          }
    });
  });

  $('#emailSubscribeButton').click( function(e) {
    e.preventDefault();
    $("#modalCloseButton").hide();
    $("#myModal .modal-body").html("<p><img src='img/spinner.gif'/> Please wait ...</p>");
    $("#myModal").modal({
      backdrop: 'static',
      keyboard: false
    });

    var parameters = {};
    parameters.email = $('#exampleInputEmail1').val();

    // start the ajax request to the server
    $.ajax({
          url: 'subscribe',
          type: 'POST',
          data: parameters,
          dataType: 'json',
          success: function(data)
          {
            // check the data
            // was it a success
            if(data.error)
            {
              $("#myModal .modal-title").html("Error Subscribing");
              $("#myModal .modal-body").html("<p>We have an error: " + data.message + "</p><p>Please try again</p>");
              $("#modalCloseButton").show();
            }
            else
            {
              $("#myModal .modal-title").html("Subscribed");
              $("#myModal .modal-body").html("<p>Thanks for subscribing!</p>");
              $("#modalCloseButton").show();
            }
          },
          error: function()
          {
            $("#myModal .modal-body").html("<p>An error occured subscribing your email. Please try again later.");
            $("#modalCloseButton").show();
          }
        });
  });

  // /* backstretch slider */
  // $.backstretch([
  //   "imgbg/bg-backstretch01.jpg",
  //   "imgbg/bg-backstretch02.jpg",
  //   "imgbg/bg-backstretch03.jpg",
  //   "imgbg/bg-backstretch04.jpg"
  //   ], {
  //     fade: 2000,
  //     duration: 6000
  // });

  /* navbar */
  // $(window).scroll(function(){
  //   if($(window).scrollTop() > 175){
  //     $('.navbar-primary .navbar-nav > li.dropdown.open').removeClass('open');
  //     $('.navbar-primary .navbar-collapse.in').removeClass('in');
  //   }
  //   if($(window).scrollTop() > 180){
  //       $('.navbar-secondary-hide > .navbar').addClass('navbar-fixed-top container');
  //       $('.navbar-secondary').removeClass('navbar-secondary-hide');
  //   }else{
  //       $('.navbar-secondary > .navbar').removeClass('navbar-fixed-top container');
  //       $('.navbar-secondary').addClass('navbar-secondary-hide');
  //   }
  // });
  
  // $('.navbar-primary').clone().prependTo('.navbar-secondary');
  // $('.navbar-secondary > .navbar').removeClass('navbar-primary');
  // $('.navbar-secondary > .navbar .navbar-collapse').attr('id', 'bs-example-navbar-collapse-2');
  // $('.navbar-secondary > .navbar .navbar-toggle').attr('data-target', '#bs-example-navbar-collapse-2');


  // /* magnify image */
  // $('.portfolio-image').magnificPopup({
  //   delegate: '[data-image="image-group"]',
  //   type: 'image',
  //   gallery:{
  //     enabled:true
  //   },
    
  // });

  // $('.portfolio-image-alt').magnificPopup({
  //   type: 'image',
  //   delegate: 'a.image-zoom'
  // });


  /* scrolltop */
  $('.scrolltop').on('click', function(event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
  });


  // /* masonry layout */
  // var $container = $('.container-blog');
  // $container.imagesLoaded( function(){
  //   $container.masonry();
  // });

  // make all portfolio images clickable
  $('.portfolio-image').click( function() { 
    // find the a tag in this and get its target
    window.location.href = ($(this).find('a').attr('href'));
  });

  

});