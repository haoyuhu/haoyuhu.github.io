**What CRC is**
CRC is an error-detecting code widely used in digital networks and storage devices. The sender treats the bitstream as a polynomial over `GF(2)`, divides it by a fixed generator polynomial, and appends the remainder as a short check value.

**Why the arithmetic is just XOR**
CRC uses modulo-2 arithmetic:
- `1 - 1 = 0`
- `1 - 0 = 1`
- `0 - 1 = 1`
- subtraction is XOR
- there are no carries or borrows

**How it is computed**
- Let the generator polynomial `G(x)` have degree `n`.
- Write the coefficients of `G(x)` as bits; this `(n+1)`-bit value is the divisor.
- Append `n` zero bits to the original message.
- Divide the padded message by the divisor using modulo-2 division, aligned from the highest bit.
- The final `n`-bit remainder is the CRC.
- Append that remainder to the original message to form the CRC codeword.

**Example**
- Message: `11100011`
- Generator polynomial: `G(x) = x^5 + x^4 + x + 1`
- Binary divisor: `110011`
- Highest power is `5`, so pad five zeros: `1110001100000`
- `1110001100000` modulo-2 divided by `110011` leaves remainder `11010`
- Transmitted codeword: `11100011` + `11010` = `1110001111010`

**At the receiver**
Divide the received codeword by the same generator:
- remainder `0` -> no error detected
- non-zero remainder -> corruption detected

**Boundary of the tool**
CRC is excellent for catching accidental bit errors cheaply. It is **not** a reliable integrity or authenticity check:
- CRCs are linear
- an attacker can modify data and recompute a matching CRC
- if intentional tampering matters, use a cryptographic hash or, better, a MAC
