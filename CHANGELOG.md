# xml-muncher

## 0.0.15

### Patch Changes

- 7b31321: Empty elements are now converted to `null`.

## 0.0.14

### Patch Changes

- bec492d: Fix README to reflect API change :-)

## 0.0.13

### Patch Changes

- 5ac80f3: The `XMLMuncher` class is now the default export of the package.

## 0.0.12

### Patch Changes

- d0775a6: Optimize memory usage by inspecting the events the user actually subscribed to.

## 0.0.11

### Patch Changes

- 623fcbc: Separate `munch()` from `munchStream()` again

## 0.0.10

### Patch Changes

- eeb192d: Munching can now be stopped by invoking the `.stop()` function.

## 0.0.9

### Patch Changes

- 9666062: Update `vitest` dependency.

## 0.0.8

### Patch Changes

- 90b53d7: Dummy release to get my release scripts under control. :-)

## 0.0.7

### Patch Changes

- 3a884a6: Consolidate `munchString` into `munch`, which now provides overloads for string and stream inputs

## 0.0.6

### Patch Changes

- d67ed44: Change package to `module: true`. Good luck!
- d67ed44: Made `munchFile` wait for `munch` to resolve
