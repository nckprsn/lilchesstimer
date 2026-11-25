
// --------------------------------------------------

var FSM = function( states , context , initial_state = false )
{
	this.states = states;
	this.context = context;

	if( initial_state )
	{
		this.set( initial_state );
	}
};

// --------------------------------------------------

FSM.prototype.get = function()
{
	return this.state;
};

// --------------------------------------------------

FSM.prototype.set = function( incoming_state = false , data = false )
{
	// Exit the current/outgoing state

	const outgoing_state = this.state;

	if( outgoing_state ) this.states[ outgoing_state ].exit.call( this.context , data );

	// Enter the new/incoming state

	this.state = incoming_state;

	if( incoming_state ) this.states[ incoming_state ].enter.call( this.context , data );

	// If the context has a container set a `is_${state}` class on it

	if( typeof this.context.$container !== 'undefined' )
	{
		this.context.$container.classList.remove( `is_${ outgoing_state }` );
		this.context.$container.classList.add( `is_${ incoming_state }` );
	}
};

// --------------------------------------------------

