// --------------------------------------------------

var LOBBY = function( $container )
{
	this.$container = $container;

	// DOM references

	this.$minutes_per_player_input = this.$container.querySelector( '.lobby_minutes_per_player_input' );
	this.$extra_seconds_per_move_input = this.$container.querySelector( '.lobby_extra_seconds_per_move_input' );

	this.$go_button = this.$container.querySelector( '.lobby_go_button' );

	// Bind event listeners

	this.go_button_click = this.go_button_click.bind( this );

	// Hook up event listeners

	this.$go_button.addEventListener( 'click' , this.go_button_click );
};

// --------------------------------------------------

LOBBY.prototype.go_button_click = function( event )
{
	event.preventDefault();

	main.state.set( 'timer',
	{
		minutes_per_player: this.$minutes_per_player_input.value,
		extra_seconds_per_move: this.$extra_seconds_per_move_input.value,
	});
};

// --------------------------------------------------
