# JaanLang Documentation

JaanLang is a programming language for couples and romantic people. It is a minimal language that anyone can learn very quickly. Enjoy the romantic coding experience!

![Cover](https://github.com/itsfuad/JaanLang/blob/main/cover.png)

## Syntax

### Basic Commands

#### `hi jaan`
Start of the program.

#### `bye jaan`
End of the program.

#### `dhoro`
Declare a variable: `let <variableName>`.

#### `holo`
Assign a value to a variable: `<variableName> = <value>`.

#### `bolo`
Print statement: `console.log(<value>)`.

#### `kichu bolar nai`
End of any block.

### Conditionals

#### `jodi <variableName> <operator> <value> tahole`
If statement.

- `<variableName>`: Name of the variable.
- `<operator>`: Comparison operator (e.g., `hoy`, `na hoy`, `theke beshi`, `theke kom`, etc.).
- `<value>`: Value to compare against.

#### `tahole`
Start of the if block: `{`.

### Loops

#### `bar`
Range loop: `for (let $ = 1; $ <= <value>; $++) {`.

- `$`: Iteration count variable.
- `<value>`: The upper limit for the loop.

### Comments

#### `#`
Comment: Lines starting with `#` are ignored.

## Example

```jaan
hi jaan
    # This is a comment
    dhoro id holo 6
    dhoro kichuEkta holo id
    dhoro amrNaam holo "Tamanna"

    jodi kichuEkta <= 0 na hoy tahole
        bolo "0 theke kom"
    nahole jodi kichuEkta > 78 hoy tahole
        bolo "0 theke beshi"
    nahole
        bolo "huh?"
    kichu bolar nai


    jodi kichuEkta 0 hoy tahole
        bolo "0 hoyeche"
    kichu bolar nai

    jodi kichuEkta 0 na hoy tahole
        bolo "0 hoy nai"
    kichu bolar nai

    jodi kichuEkta 15 theke beshi hoy tahole
        bolo "0 theke beshi hoyeche"
    kichu bolar nai

    jodi kichuEkta 5 theke kom na hoy tahole
        bolo "0 theke kom hoyeche"
    kichu bolar nai

    jodi kichuEkta 9 hoy tahole
        bolo "9 hoyeche"
    kichu bolar nai

    10 bar
        bolo "Sorry Jaan " + $
    kichu bolar nai

bye jaan
```
