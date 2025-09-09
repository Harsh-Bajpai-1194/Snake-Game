import pygame
import random
import sys
pygame.init()
WIDTH, HEIGHT = 600, 400
CELL = 20
screen = pygame.display.set_mode((WIDTH, HEIGHT))
clock = pygame.time.Clock()
snake = [(100, 100)]
direction = (CELL, 0)
food = (random.randrange(0, WIDTH, CELL), random.randrange(0, HEIGHT, CELL))
def draw():
    screen.fill((0, 0, 0))
    for x, y in snake:
        pygame.draw.rect(screen, (0, 255, 0), (x, y, CELL, CELL))
    pygame.draw.rect(screen, (255, 0, 0), (*food, CELL, CELL))
    pygame.display.flip()
while True:
    for event in pygame.event.get():
        if event.type==pygame.QUIT:
            pygame.quit()
            sys.exit()
    keys = pygame.key.get_pressed()
    if keys[pygame.K_UP] and direction != (0, CELL): direction = (0, -CELL)
    if keys[pygame.K_DOWN] and direction != (0, -CELL): direction = (0, CELL)
    if keys[pygame.K_LEFT] and direction != (CELL, 0): direction = (-CELL, 0)
    if keys[pygame.K_RIGHT] and direction != (-CELL, 0): direction = (CELL, 0)
    new_head = (snake[0][0] + direction[0], snake[0][1] + direction[1])
    if (new_head in snake or
        new_head[0] < 0 or new_head[0] >= WIDTH or
        new_head[1] < 0 or new_head[1] >= HEIGHT):
        pygame.quit()
        sys.exit()
    snake.insert(0, new_head)
    if new_head == food: food = (random.randrange(0, WIDTH, CELL), random.randrange(0, HEIGHT, CELL))
    else: snake.pop()
    draw()
    clock.tick(10)