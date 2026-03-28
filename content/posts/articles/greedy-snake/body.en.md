## Overview

This post presents a C++ console-based Snake game implementation inspired by an existing project [C++贪吃蛇](http://www.cnblogs.com/gq-ouyang/archive/2012/12/09/2810218.html#2858914). Two important issues have been addressed:

- **Food placement**: Ensures randomly generated food coordinates do not overlap with any existing snake nodes.
- **Collision detection**: Extends collision checks beyond borders to include the snake's head colliding with its own body.

The implementation utilizes a modular OOP design encapsulating the game's frame display, the snake linked list representation, and the snake's movement and direction handling.

---

## Key Components

| Component       | Responsibility                                |
|-----------------|----------------------------------------------|
| `Frame`         | Maintains and renders the game window/frame with borders.
| `snakeNode`     | Represents segments of the snake as a doubly linked list.
| `movement`      | Manages the snake’s movement, user input direction changes, and game logic such as food placement and collision detection.

---

## Core Logic Flow

```mermaid
flowchart TD
    Start[Game Start]
    Input[User inputs board size and speed]
    InitFrame[Initialize Frame with borders]
    InitSnake[Create initial snake node center]
    RandomFood[Place first food ensuring no collision]
    Loop[Game Loop]
    CheckInput[Check for user input]
    ChangeDir[Change direction if input]
    MoveSnake[Move snake forward]
    Collision[Check collision with wall or self]
    GameOver[Print "Game Over!" and exit]
    EatFood[Eat food and grow snake]
    NoFood[Move snake normally]
    Render[Render frame]
    Sleep[Wait according to speed]

    Start --> Input --> InitFrame --> InitSnake --> RandomFood --> Loop
    Loop --> CheckInput -->|key pressed| ChangeDir --> MoveSnake
    Loop -->|no key| MoveSnake
    MoveSnake --> Collision
    Collision -->|collision| GameOver
    Collision -->|no collision| EatFood
    EatFood --> RandomFood
    NoFood --> Render --> Sleep --> Loop
    EatFood --> Render

```

---

## Code Highlights

### Frame Setup and Rendering

Handles border creation using `#` characters and displays the grid, using a 2D vector of chars.

```cpp
void Frame::initializeFrame() {
    if (width <= 0 || height <= 0) {
        cerr << "WRONG FRAME DIMENSION!" << endl;
        exit(EXIT_FAILURE);
    }

    window.assign(height, vector<char>(width, ' '));

    // Draw vertical borders
    for (int i = 0; i < height; ++i) {
        window[i][0] = window[i][width - 1] = '#';
    }
    // Draw horizontal borders
    for (int j = 0; j < width; ++j) {
        window[0][j] = window[height - 1][j] = '#';
    }
}
```

### Snake Node Management

The snake is a doubly linked list where new heads are added with each move; tail nodes are deleted unless food is eaten.

```cpp
void snakeNode::addHead(int x, int y) {
    snakeNode* newNode = new snakeNode(x, y);
    newNode->next = head;
    if (head) head->prior = newNode;
    else tail = newNode;
    head = newNode;
    frame.window[x][y] = '~'; // Draw snake segment
}

void snakeNode::delTail() {
    if (!tail) return;
    frame.window[tail->x][tail->y] = ' ';
    snakeNode* oldTail = tail;
    tail = tail->prior;
    if (tail) tail->next = nullptr;
    else head = nullptr;
    delete oldTail;
}
```

### Movement and Game Logic

Encapsulates direction state and input handling. The food is repeatedly placed until it doesn't collide with the snake.

```cpp
void movement::randomFood() {
    srand((unsigned)time(NULL));
    do {
        fx = rand() % (frame.height - 2) + 1;
        fy = rand() % (frame.width - 2) + 1;
    } while (block(fx, fy)); // Ensure food not on snake

    frame.window[fx][fy] = 'x';
}

void movement::move() {
    int h = head->x, w = head->y;
    switch(dir) {
        case UP: --h; break;
        case DOWN: ++h; break;
        case LEFT: --w; break;
        case RIGHT: ++w; break;
    }

    if (outOfFrame(h, w) || block(h, w)) {
        cout << "Game Over!" << endl;
        exit(EXIT_FAILURE);
    }

    if (h == fx && w == fy) {
        head->addHead(fx, fy); // Grow snake
        randomFood();          // Place new food
    } else {
        head->addHead(h, w);   // Move forward normally
        tail->delTail();       // Remove tail
    }
}
```

### User Input Handling

Allows user to modify snake direction with ‘WASD’, preventing reversal.

```cpp
void movement::changeDirection(char key) {
    switch (key) {
        case 'w': if (dir != DOWN) dir = UP; break;
        case 's': if (dir != UP) dir = DOWN; break;
        case 'a': if (dir != RIGHT) dir = LEFT; break;
        case 'd': if (dir != LEFT) dir = RIGHT; break;
    }
}
```

---

## Usage

Compile with a modern C++ compiler. The program reads board dimensions and speed, then runs the game in the console, redrawing the frame each iteration.

Remember to run in Windows console due to `conio.h` and `windows.h` dependencies for keyboard input and sleep functions.

---

This updated C++ Snake game implementation demonstrates meticulous collision management and clean modular code suitable for learning fundamental game programming techniques in C++.

---

![Game frame example](/legacy/greedy-snake/0.jpeg)

---
