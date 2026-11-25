
// --------------------------------------------------

const MAIN = function( $container )
{
	this.$container = $container;

	// DOM references

	this.$screen_lobby = this.$container.querySelector( '.screen_lobby' );
	this.$screen_timer = this.$container.querySelector( '.screen_timer' );

	// Main state machine

	this.state = new FSM( this.states , this , 'lobby' );
};	

// --------------------------------------------------

MAIN.prototype.states =
{
	lobby:
	{
		enter: function( data )
		{
			// Create a new lobby
			this.lobby = new LOBBY( this.$screen_lobby.querySelector( '.lobby' ) );

			// Show the lobby screen
			this.$screen_lobby.removeAttribute( 'hidden' );
		},

		exit: function( data )
		{
			// Hide the lobby screen
			this.$screen_lobby.setAttribute( 'hidden' , true );

			// Destroy our lobby
			this.lobby = null;
		},
	},

	timer:
	{
		enter: function( data )
		{
			// Create a new timer
			this.timer = new TIMER( this.$screen_timer.querySelector( '.timer' ) ,
			{
				minutes_per_player: data.minutes_per_player,
				extra_seconds_per_move: data.extra_seconds_per_move,
			});

			// Show the timer screen
			this.$screen_timer.removeAttribute( 'hidden' );
		},

		exit: function( data )
		{
			// Hide the timer screen
			this.$screen_timer.setAttribute( 'hidden' , true );

			// Destroy our timer
			this.timer = null;
		},
	},
};

// --------------------------------------------------
