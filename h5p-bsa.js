var H5P = H5P || {};

H5P.BasicShortAnswers = (function($) {

    /**
     * @param params - JSON object containing the values of keys defined in
     *                 semantics.json after being populated within Drupal
     * @param id
     * @constructor
     */
    function BasicShortAnswers(params, id) {
        this.params = params;
        this.id = id;

        // include Fill in the Blanks library https://h5p.org/using-other-libraries
        if (this.params.question) {
            // Initialize task
            this.question = H5P.newRunnable(this.params.question, this.id);

            // Trigger resize events on the task:
            this.on('resize', function (event) {
                this.question.trigger('resize', event);
            });
        }
    }

    /**
     * Attach function
     * @param $container
     */
    BasicShortAnswers.prototype.attach = function ($container) {
        $container.addClass('h5p-bsa');
        $container.append('<div class="passage">' + this.params.passage + '</div>');

        // include Fill in the Blanks library https://h5p.org/using-other-libraries
        if (this.question) {
            // Create a container for the task
            var $taskHolder = $('<div>');

            // Attach the task to the container
            this.question.attach($taskHolder);

            // Append the task container to our content types container
            $container.append($taskHolder);
        }
    };

    return BasicShortAnswers;

})(H5P.jQuery);
