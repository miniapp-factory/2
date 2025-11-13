"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const BOARD_SIZE = 4;
const TILE_VALUES = [2, 4];
const TILE_PROBABILITIES = [0.9, 0.1];

type Board = number[][];

function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function addRandomTile(board: Board): Board {
  const emptyCells: [number, number][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) emptyCells.push([r, c]);
    }
  }
  if (emptyCells.length === 0) return board;
  const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const rand = Math.random();
  const value = rand < TILE_PROBABILITIES[0] ? TILE_VALUES[0] : TILE_VALUES[1];
  board[row][col] = value;
  return board;
}

function slideAndMerge(row: number[]): number[] {
  const filtered = row.filter((v) => v !== 0);
  const merged: number[] = [];
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
  }
  while (merged.length < BOARD_SIZE) merged.push(0);
  return merged;
}

function move(
  board: Board,
  direction: "up" | "down" | "left" | "right"
): { board: Board; scoreDelta: number } {
  const newBoard: Board = board.map((row) => [...row]);
  let scoreDelta = 0;
  if (direction === "up" || direction === "down") {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col: number[] = [];
      for (let r = 0; r < BOARD_SIZE; r++) col.push(newBoard[r][c]);
      const original = [...col];
      const processed = slideAndMerge(direction === "up" ? col : col.reverse());
      if (direction === "down") processed.reverse();
      for (let r = 0; r < BOARD_SIZE; r++) {
        newBoard[r][c] = processed[r];
        scoreDelta += processed[r] - original[r];
      }
    }
  } else {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row = newBoard[r];
      const original = [...row];
      const processed = slideAndMerge(direction === "left" ? row : row.reverse());
      if (direction === "right") processed.reverse();
      newBoard[r] = processed;
      scoreDelta += processed.reduce((a, b) => a + b, 0) - original.reduce((a, b) => a + b, 0);
    }
  }
  return { board: newBoard, scoreDelta };
}

function hasMoves(board: Board): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < BOARD_SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < BOARD_SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
}

export default function Game() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);

  useEffect(() => {
    const b: Board = addRandomTile(addRandomTile(createEmptyBoard()));
    setBoard(b);
  }, []);

  const handleMove = (dir: "up" | "down" | "left" | "right") => {
    if (gameOver || won) return;
    const { board: newBoard, scoreDelta } = move(board, dir);
    if (JSON.stringify(newBoard) === JSON.stringify(board)) return;
    // Add a random tile after the move
    const boardAfterTile = addRandomTile(newBoard);
    setBoard(boardAfterTile);
    setScore((s) => s + scoreDelta);
    if (boardAfterTile.flat().includes(2048)) setWon(true);
    if (!hasMoves(boardAfterTile)) setGameOver(true);
  };

  const restart = () => {
    const b: Board = addRandomTile(addRandomTile(createEmptyBoard()));
    setBoard(b);
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const tileColor = (value: number) => {
    switch (value) {
      case 2: return "bg-yellow-200";
      case 4: return "bg-yellow-300";
      case 8: return "bg-orange-200";
      case 16: return "bg-orange-300";
      case 32: return "bg-red-200";
      case 64: return "bg-red-300";
      case 128: return "bg-purple-200";
      case 256: return "bg-purple-300";
      case 512: return "bg-indigo-200";
      case 1024: return "bg-indigo-300";
      case 2048: return "bg-green-400";
      default: return "bg-gray-200";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xl font-semibold">2048 Mini App</div>
      <div className="text-lg">Score: {score}</div>
      <div className="grid grid-cols-4 gap-2">
        {board.flat().map((v: number, idx: number) => (
          <div
            key={idx}
            className={`flex items-center justify-center h-16 w-16 rounded-md text-2xl font-bold ${tileColor(v)} ${
              v === 0 ? "text-transparent" : ""
            }`}
          >
            {v}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => handleMove("up")}>↑</Button>
        <Button onClick={() => handleMove("left")}>←</Button>
        <Button onClick={() => handleMove("right")}>→</Button>
        <Button onClick={() => handleMove("down")}>↓</Button>
      </div>
      {(gameOver || won) && (
        <div className="text-xl font-semibold">
          {won ? "You Win!" : "Game Over"}
        </div>
      )}
      <Button onClick={restart}>Restart</Button>
    </div>
  );
}
