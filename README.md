# Enigma

A working [Enigma I](https://en.wikipedia.org/wiki/Enigma_machine) in the
browser, built to show how the machine works rather than just what it outputs.

Press a key and a wiring diagram draws the current's path: through the
plugboard, right to left across the three rotors, around the reflector, and
back out to a lamp. The rotor columns redraw as the rotors step, so you can see
why the same letter never takes the same path twice in a row, and why no letter
can ever encrypt to itself.

## What you can do

- **Type** on the on-screen keyboard, your own keyboard, or the input field.
  `Backspace` or **Undo** steps the machine back one key press.
- **Turn the rotors** by dragging their windows, with the arrow buttons, or with
  the arrow keys once a window has focus. Swap rotor types from the menus.
- **Choose a reflector**: A, B, C, B-thin or C-thin.
- **Cable the plugboard** by clicking two letters. Click a cabled letter to
  unplug it.
- **Slow motion** draws the path slowly enough to follow each step.
- **Copy link** shares the exact setup a message started from, so someone else
  can decrypt it by typing the ciphertext.

## Guarantees, and where they're enforced

Every configuration the app accepts must produce a working machine. The rules
that make an Enigma an Enigma are checked at three levels:

| Rule                                               | Enforced by                                                                                                                                                                                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Same settings decrypt what they encrypt            | Property test over random machines and messages (`src/utils/machine.property.test.ts`)                                                                                                                       |
| No letter encrypts to itself                       | Property test, plus a table test that every reflector pairs each letter with a different one (`src/utils/rotors.test.ts`)                                                                                    |
| Only real reflectors can be chosen                 | The `Reflector` type and the reflector table (`src/utils/rotors.ts`)                                                                                                                                         |
| A rotor can't be placed twice                      | Choosing a rotor that's already in the box swaps the two (`src/components/rotors/spindle.tsx`)                                                                                                               |
| A letter takes one plugboard cable at most         | A cabled socket can only be unplugged, never re-cabled (`toggleSocket` in `src/utils/plugboard.ts`)                                                                                                          |
| Settings from outside are all-or-nothing           | `parseConfig` (`src/utils/config.ts`) checks a shared link. One bad field rejects the whole link, the machine keeps its defaults, and each problem is listed with a fix. It never throws, which is fuzz-tested |
| The diagram shows exactly what the machine encodes | One function, `traceChar`, produces both the encoded letter and every segment of the drawn path; a property test checks they agree                                                                           |

Property tests use [fast-check](https://fast-check.dev/): it generates
machines (any three distinct rotors, any positions, any reflector, 0 to 13
cables) and shrinks any failure to the smallest setup that breaks the rule.

## Bugs found and fixed

An audit of the original logic against the real machine found:

1. **Three of the eight "reflectors" weren't reflectors.** Beta and Gamma are
   the M4's thin fourth rotors, and with either one decryption failed every
   time. ETW is the identity entry wheel, so every letter encrypted to itself.
   They're gone, and the type no longer allows them.
2. **The reflector turned with the left rotor.** On the real machine it's fixed
   to the housing. Output was only correct while the left rotor sat at A.
3. **The middle rotor never double-stepped**, so messages drifted from a real
   Enigma after a turnover (ADU → ADV → AEW → **BFX**, not AEX).
4. **Rotor V never carried** its neighbour, because its notch at Z wrapped past
   the turnover check.
5. **A rotor couldn't be set back to A**, because position 0 was treated as
   missing.

Each has a regression test that fails on the original code.

## Scripts

```sh
pnpm install
pnpm start        # dev server
pnpm test         # unit, property and UI tests
pnpm check-types  # TypeScript
pnpm lint         # Prettier
pnpm lint:code    # ESLint, including jsx-a11y
pnpm build        # static build in dist/
```

## Not modelled

Ring settings (Ringstellung) and the four-rotor M4. Every setting here behaves
like a ring setting of A.

## Helpful resources

### Articles

- [Enigma Rotor Details](https://en.wikipedia.org/wiki/Enigma_rotor_details)
- [Cryptanalysis of the Enigma](https://en.wikipedia.org/wiki/Cryptanalysis_of_the_Enigma)
- [Enigma and the Bombe](http://www.ellsbury.com/enigmabombe.htm)

### Videos

- [Enigma Machine — Numberphile](https://www.youtube.com/watch?v=G2_Q9FoD-oQ)
- [Flaw in the Enigma Code — Numberphile](https://www.youtube.com/watch?v=V4V2bpZlqx8)
- [Enigma Machine Demonstration — Doyle New York](https://www.youtube.com/watch?v=-mdSvGUd0_c)
- [Pringles Can Enigma Machine — Videos By Kevin](https://www.youtube.com/watch?v=pZsuxZXN33g)
- [Paper Enigma Machine — Videos By Kevin](https://www.youtube.com/watch?v=UKbP3Rjxhy0)
