# Arena football decisions — V165, 2026-11-10

Coaching references read for principles; no media, motion clips or external code
were imported, and no claim of training a model on match footage is made.

- FIFA Training Centre, Playing out from the back under pressure:
  https://www.fifatrainingcentre.com/en/practice/futsal/block-2/playing-out-from-the-back-under-pressure.php
  Used as guidance for support angles and a receiving player's movement into space.
- FIFA Training Centre, Tim Dittmer, Goalkeeper's positioning in and out of possession:
  https://www.fifatrainingcentre.com/en/practice/elite-sessions/goalkeeper/in_and_out_of_possession.php
  Used for goal protection versus intervention, angle/distance and measured footwork.
- The FA, Tony Elliott, Futsal goalkeeping fundamentals:
  https://www.thefa.com/bootroom/resources/coaching/futsal-goalkeeping-fundamentals
  Used as guidance for reading cues, set posture and choosing a block versus a dive.

Implementation is original in japon-tactics.js. Football decisions use actual
positions, velocities and space. Goalkeepers see a delayed observation, then a
shared ball-aero projection including the actual arena boards; they do not read
the future simulation result. Saves still require physical swept contact.
Corners of the two-side pitch are rectangular. Close-range finishing is replaced
by a shooting channel, ground passes are led toward the receiver, and turn/accel
limits plus a planted wind-up align action with the foot contact.

Arena's continuousGround flag addresses exact-radius grounded ball states missing
rolling resistance in the shared integrator. It is opt-in for this arena: normal
match / penalty / free-kick defaults remain unchanged. Refer to tests/arena-football.cjs
for geometry, movement, keeper/rebound and pass/shot preparation checks.
