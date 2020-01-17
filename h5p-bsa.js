var H5P = H5P || {};

H5P.BasicShortAnswers = (function($) {

    /**
     * Constructor
     */
    function BasicShortAnswers(params, id) {
        this.params = params;
        this.id = id;
    }

    BasicShortAnswers.prototype.attach = function ($container) {
        $container.addClass('h5p-bsa');
        $container.append('<div class="passage">' + this.params.passage + '</div>');
    };

    return BasicShortAnswers;

})(H5P.jQuery);
