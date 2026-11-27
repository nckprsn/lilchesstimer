// --------------------------------------------------

var TIMER = function( $container , settings = {} )
{
	this.$container = $container;

	// Settings

	this.minutes_per_player = ( settings.minutes_per_player || 10 );
	this.extra_seconds_per_move = ( !settings.extra_seconds_per_move && settings.extra_seconds_per_move !== 0 ? 3 : settings.extra_seconds_per_move );

	// DOM references

	this.$player_buttons =
	[
		this.$container.querySelector( '.timer_player_1_button' ),
		this.$container.querySelector( '.timer_player_2_button' ),
	];

	this.$playpause_button = this.$container.querySelector( '.timer_playpause_button' );
	this.$reset_button = this.$container.querySelector( '.timer_reset_button' );
	this.$back_button = this.$container.querySelector( '.timer_back_button' );

	// Bind event listeners

	this.player_button_first_click = this.player_button_first_click.bind( this );
	this.player_button_click = this.player_button_click.bind( this );

	this.playpause_button_click = this.playpause_button_click.bind( this );
	this.reset_button_click = this.reset_button_click.bind( this );
	this.back_button_click = this.back_button_click.bind( this );

	// Bind other callbacks

	this.tick = this.tick.bind( this );

	// Hook up control event listeners

	this.$playpause_button.addEventListener( 'click' , this.playpause_button_click );
	this.$reset_button.addEventListener( 'click' , this.reset_button_click );
	this.$back_button.addEventListener( 'click' , this.back_button_click );

	// Bits and bobs we'll use later

	this.timer_id = null;

	this.timer_mark = null;

	// Timer state machine

	this.state = new FSM( this.states , this , 'ready' );
};

// --------------------------------------------------

TIMER.prototype.states =
{
	ready:
	{
		enter: function( data )
		{
			// (Re)set player times in milliseconds
			this.player_times =
			[
				this.minutes_per_player * 60 * 1000,
				this.minutes_per_player * 60 * 1000,
			];

			// (Re)enable both player buttons
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.removeAttribute( 'disabled' );
			});

			// Update player button times
			this.update_player_button_times();

			// Hook up player button event listeners
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.addEventListener( 'click' , this.player_button_first_click );
			});

			// Disable the play/pause button
			this.$playpause_button.setAttribute( 'disabled' , true );

			// Disable the reset button
			this.$reset_button.setAttribute( 'disabled' , true );

			// Remove the active player indicator
			this.$container.removeAttribute( 'data-active-player' );
		},

		exit: function( data )
		{
			// Remove player button event listeners
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.removeEventListener( 'click' , this.player_button_first_click );
			});

			// (Re)enable the play/pause button
			this.$playpause_button.removeAttribute( 'disabled' );

			// (Re)enable the reset button
			this.$reset_button.removeAttribute( 'disabled' );
		},
	},

	running:
	{
		enter: function( data )
		{
			if( typeof data.player_index !== 'undefined' )
			{
				this.set_active_player( data.player_index );
			}

			// Hook up player button event listeners
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.addEventListener( 'click' , this.player_button_click );
			});

			// Enable/disable player buttons
			this.$player_buttons[ this.get_active_player() ].removeAttribute( 'disabled' );
			this.$player_buttons[ this.get_inactive_player() ].setAttribute( 'disabled' , true );

			// Keep track of the exact time we started our timer
			this.timer_mark = Date.now();

			// Stop ticking (if applicable)
			if( this.timer_id !== null ) clearInterval( this.timer_id );

			// Start ticking
			this.timer_id = setInterval( this.tick , 50 );
		},

		exit: function( data )
		{
			// Stop ticking
			clearInterval( this.timer_id );

			// Disable all player buttons
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.setAttribute( 'disabled' , true );
			});

			// Remove player button event listeners
			this.$player_buttons.forEach( $player_button =>
			{
				$player_button.removeEventListener( 'click' , this.player_button_click );
			});
		},
	},

	paused:
	{
		enter: function( data )
		{
		},

		exit: function( data )
		{
		},
	},

	finished:
	{
		enter: function( data )
		{
			// Disable the play/pause button
			this.$playpause_button.setAttribute( 'disabled' , true );
		},

		exit: function( data )
		{
			// (Re)enable the play/pause button
			this.$playpause_button.removeAttribute( 'disabled' );
		},
	},
};

// --------------------------------------------------

TIMER.prototype.tick = function()
{
	this.time_check();
};

// --------------------------------------------------

TIMER.prototype.time_check = function()
{
	const time_elapsed = Date.now() - this.timer_mark;

	// Reset this to get an accurate time elapsed since the last check next time
	this.timer_mark = Date.now();

	// Update the active player's remaining time

	this.player_times[ this.get_active_player() ] -= time_elapsed;

	this.update_player_button_times();

	// Check for end condition

	if( this.player_times[ this.get_active_player() ] <= 0 )
	{
		this.player_times[ this.get_active_player() ] = 0;

		this.state.set( 'finished' );

		// Indicates to caller that game is over
		return false;
	}

	// End condition not met
	return true;
};

// --------------------------------------------------

TIMER.prototype.player_button_first_click = function( event )
{
	event.preventDefault();

	this.set_active_player( event.target.getAttribute( 'data-player-index' ) );

	this.state.set( 'running' , { player_index: this.get_inactive_player() } );
};

// --------------------------------------------------

TIMER.prototype.player_button_click = function( event )
{
	event.preventDefault();

	// Check nobody's gone below zero since the last tick
	// (returns false if end game condition is met)
	if( !this.time_check() ) return false;

	// Are we adding any seconds back on?
	if( this.extra_seconds_per_move )
	{
		this.player_times[ this.get_active_player() ] += this.extra_seconds_per_move * 1000;
	}

	this.state.set( 'running' , { player_index: this.get_inactive_player() } );
};

// --------------------------------------------------

TIMER.prototype.playpause_button_click = function( event )
{
	event.preventDefault();

	switch( this.state.get() )
	{
		case 'running' : this.state.set( 'paused' ); break;
		case 'paused' : this.state.set( 'running' ); break;
	}
};

// --------------------------------------------------

TIMER.prototype.reset_button_click = function( event )
{
	event.preventDefault();

	this.state.set( 'ready' );
};

// --------------------------------------------------

TIMER.prototype.back_button_click = function( event )
{
	event.preventDefault();

	this.state.set( false );
	main.state.set( 'lobby' );
};

// --------------------------------------------------

TIMER.prototype.format_time = function( input )
{
	// Make sure we never go below zero
	if( input < 0 ) input = 0;

	let hours   = Math.floor( input / 1000 / 60 / 60 );
	let minutes = Math.floor( input / 1000 / 60 ) % 60;
	let seconds = Math.floor( input / 1000 ) % 60;

	let parts = [];

	if( hours > 0 ) parts.push( hours );
	if( minutes >= 0 ) parts.push( this.pad( minutes ) );
	parts.push( this.pad( seconds ) );

	return parts.join( ':' );
};

// --------------------------------------------------

TIMER.prototype.pad = function( input , length = 2 )
{
	let output = String( input );

	if( output.length >= length ) return input;

	return '0'.repeat( length - output.length ) + output;
};

// --------------------------------------------------

TIMER.prototype.set_active_player = function( player_index )
{
	this.active_player = player_index;
	this.$container.setAttribute( 'data-active-player' , this.active_player );
};

// --------------------------------------------------

TIMER.prototype.get_active_player = function()
{
	return this.active_player;
};

// --------------------------------------------------

TIMER.prototype.get_inactive_player = function()
{
	return ( parseInt( this.active_player ) + 1 ) % 2;
};

// --------------------------------------------------

TIMER.prototype.update_player_button_times = function()
{
	this.$player_buttons.forEach( ( $player_button , player_index ) =>
	{
		$player_button.innerHTML = this.format_time( this.player_times[ player_index ] );
		$player_button.style.setProperty( '--time-elapsed-ratio' , this.player_times[ player_index ] / ( this.minutes_per_player * 1000 * 60 ) );
	});
};

// --------------------------------------------------
