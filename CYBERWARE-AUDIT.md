# CWN Cyberware Automation Audit

All 88 catalogue entries were audited against the SWNR 2.3.x Cyberware schema
and the current Foundry VTT v14 runtime. Native Cyberware fields are preserved,
but no speculative Active Effects are embedded. SWNR itself presently automates
installed Strain; most catalogue effects require context, activation decisions,
targeting, duration, stacking, or rules adjudication that the native schema does
not safely encode.

The Content Pack stores the classification at:

`flags["cwn-content-pack"].cyberware.automationLevel`

It also stores the neutral maintenance contract at:

`flags["cwn-content-pack"].cyberwareMaintenance`

## Combat Enhancements handler candidate

These effects are suitable candidates for an explicit companion-module handler. The Content Pack does not itself automate them.

- Banshee Module
- Body Blades I
- Body Blades II
- Coordination Augment I
- Coordination Augment II
- Dermal Armor I
- Dermal Armor II
- Dermal Armor III
- Dermal Armor/Trauma Shielding
- Emergency Stabilization Factor
- Enhanced Reflexes I
- Enhanced Reflexes II
- Enhanced Reflexes III
- Eye Mod/Dazzler
- Eye Mod/Flechette Launcher
- Gunlink
- Iron Hand Aegis
- Limbgun
- Muscle Fiber Replacement I
- Muscle Fiber Replacement II
- Neural Buffer
- Reaction Booster I
- Reaction Booster II
- Recovery Support Unit
- Redundant Systems
- Retribution Shield
- Sealed Systems Implant
- Sharkskin Electrodes
- Shock Fists
- Skillplug Jack I
- Skillplug Jack II
- Skillplug Wiring
- Skull Citadel
- Titan Gun System
- Trajectory Optimization Node
- Viper Sting
- Zombie Wires

## Contextual

These effects depend on circumstances or a specific check and remain descriptive.

- Active Sense Processor
- Aesthetic Augmentation Suite
- Ear Mod/Filter
- Ear Mod/Positional Detection
- Ear Mod/Sonar
- Ear Mod/Tracer
- Eye Mod/Impostor
- Eye Mod/Infrared Vision
- Eye Mod/Low Light Vision
- Eye Mod/Tactical View
- Eye Mod/Zoom
- Hemosynthetic Filter System
- Medical Support Readout
- Omnihand
- Poseidon Implants
- Remote Control Unit
- Skyborn Shielding
- Stick Pads

## Manual

These effects require direct GM/player adjudication or have no safe native representation.

- Assisted Glide System
- Courier Memory
- Cranial Jack
- Cyberears (pair)
- Cybereyes (pair)
- Cyberlimb
- Deadman Circuit
- Discretion Insurance Unit
- Fleshmod
- Funes Complex
- Headcomm
- Holdout Cavity
- Medusa Implant
- Neolimb
- Prosthetic Cyber I
- Prosthetic Cyber II
- Regulated Anagathic Substrate
- Sensory Recorder
- Skillplug Mental 0
- Skillplug Mental 1
- Skillplug Mental 2
- Skillplug Mental 3
- Skillplug Physical 0
- Skillplug Physical 1
- Skillplug Physical 2
- Skillplug Physical 3
- Skinmod
- Synthears (pair)
- Syntheyes (pair)
- Synthlimb

## Description only for now

These entries are intentionally conservative because their systemic interactions are too broad for safe automation.

- Cybernetic Infrastructure Baseline
- Full Body Conversion
- Therapeutic Control Dampers

## Safe Active Effects

No catalogue entry is currently classified as `safe-active-effect`. This is
intentional: neither the source catalogue nor SWNR 2.3.x proves correct target,
transfer, stacking, activation, and disabled-cyberware semantics for a generated
Active Effect. Adding an apparently convenient effect without those guarantees
could silently corrupt actor statistics.

## Native behaviour and disabled cyberware

SWNR calculates installed Cyberware Strain from actor-owned Cyberware Items.
The native Cyberware `disabled` field does not automatically remove that
Strain and does not automatically disable embedded Active Effects. CWN Combat
Enhancements therefore treats disabled cyberware as installed for maintenance
unless the GM explicitly disables maintenance with the companion-module
override.
