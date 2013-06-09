/*
  Class:      countDown
  Author:     David Walsh
  Modifications: JA:D
  Website:    http://davidwalsh.name
  Version:    custom
  Date:       11/30/2008
  Built For:  jQuery 1.2.6
*/

jQuery.fn.countDown = function(settings) {
  settings = jQuery.extend({
    startFontSize: '36px',
    endFontSize: '12px',
    duration: 1000,
    endNumber: 0,
    callBack: function() { }
  }, settings);
  return this.each(function() {
    
    //ustawienie pkt startowego
    $(this).css('fontSize', settings.startFontSize);
    
    //animacja 
    $(this).animate({'fontSize': settings.endFontSize}, settings.duration, '', function() {
      var current_time = parseInt($(this).text(), 10);
      if(current_time > settings.endNumber) {
        $(this).css('fontSize',settings.startFontSize).text(current_time - 1).countDown(settings);
      }
      else
      {
        settings.callBack(this);
      }
    });
        
  });
};