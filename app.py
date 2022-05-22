import os
from flask import Flask, flash, request, redirect, url_for, render_template
from numpy import diff
from werkzeug.utils import secure_filename
from requests import get
import time
import copy
import random


app = Flask(__name__)
app.secret_key = "123Heinrich"

@app.route('/', methods=['GET', 'POST'])
def html():
    sudoku = []
    edit0 = []
    edit1 = []
    if request.method == 'POST':
        if 'easy' in request.form:
            s = main("Easy")
            for i in s:
                if i == 0:
                    sudoku.append(" ")
                else:
                    sudoku.append(i)
                edit0.append("b")
                edit1.append("b")
        elif 'medium' in request.form:
            s = main("Medium")
            for i in s:
                if i == 0:
                    sudoku.append(" ")
                else:
                    sudoku.append(i)
                edit0.append("b")
                edit1.append("b")
        elif 'hard' in request.form:
            s = main("Hard")
            for i in s:
                if i == 0:
                    sudoku.append(" ")
                else:
                    sudoku.append(i)
                edit0.append("b")
                edit1.append("b")
        return render_template("index.html", name=sudoku, edit0=edit0, edit1=edit1)
    else:
        return render_template("index.html", name=sudoku, edit0=edit0, edit1=edit1)


class cell():
    def __init__(self, position):
        self.possibleAnswers = [1,2,3,4,5,6,7,8,9]
        self.answer = None
        self.position = position
        self.solved = False
        
    def remove(self, num):
        if num in self.possibleAnswers and self.solved == False:
            self.possibleAnswers.remove(num)
            if len(self.possibleAnswers) == 1:
                self.answer = self.possibleAnswers[0]
                self.solved = True
        if num in self.possibleAnswers and self.solved == True:
            self.answer = 0

    def solvedMethod(self):
        """ Returns whether or not a cell has been solved"""
        return self.solved

    def checkPosition(self):
        """ Returns the position of a cell within a sudoku puzzle. x = row; y = col; z = box number"""
        return self.position

    def returnPossible(self):
        """ Returns a list of possible answers that a cell can still use"""
        return self.possibleAnswers

    def lenOfPossible(self):
        """ Returns an integer of the length of the possible answers list"""
        return len(self.possibleAnswers)

    def returnSolved(self):
        """ Returns whether or not a cell has been solved"""
        if self.solved == True:
            return self.possibleAnswers[0]
        else:
            return 0
        
    def setAnswer(self, num):
        """ Sets an answer of a puzzle and sets a cell's solved method to true. This
            method also eliminates all other possible numbers"""
        if num in [1,2,3,4,5,6,7,8,9]:
            self.solved = True
            self.answer = num
            self.possibleAnswers = [num]
        else:
            raise(ValueError)
       
    def reset(self):
        """ Resets all attributes of a cell to the original conditions""" 
        self.possibleAnswers = [1,2,3,4,5,6,7,8,9]
        self.answer = None
        self.solved = False

def emptySudoku():
    ''' Creates an empty sudoku in row major form. Sets up all of the x, y, and z
        coordinates for the sudoku cells'''
    ans = []
    for x in range(1,10):
        if x in [7,8,9]:
            intz = 7
            z = 7
        if x in [4,5,6]:
            intz = 4
            z = 4
        if x in [1,2,3]:
            intz = 1
            z = 1
        for y in range(1,10):
            z = intz
            if y in [7,8,9]:
                z += 2
            if y in [4,5,6]:
                z += 1
            if y in [1,2,3]:
                z += 0
            c = cell((x,y,z))
            ans.append(c)
    return ans

def printSudoku(sudoku):
    row = []
    for i in range(81):
        row.append(sudoku[i].returnSolved())
    return(row)

def sudokuGen():
    '''Generates a completed sudoku. Sudoku is completly random'''
    cells = [i for i in range(81)] ## our cells is the positions of cells not currently set
    sudoku = emptySudoku()
    while len(cells) != 0:
        lowestNum = []
        Lowest = []
        for i in cells:
            lowestNum.append(sudoku[i].lenOfPossible())  ## finds all the lengths of of possible answers for each remaining cell
        m = min(lowestNum)  ## finds the minimum of those
        '''Puts all of the cells with the lowest number of possible answers in a list titled Lowest'''
        for i in cells:
            if sudoku[i].lenOfPossible() == m:
                Lowest.append(sudoku[i])
        '''Now we randomly choose a possible answer and set it to the cell'''
        choiceElement = random.choice(Lowest)
        choiceIndex = sudoku.index(choiceElement) 
        cells.remove(choiceIndex)                 
        position1 = choiceElement.checkPosition()
        if choiceElement.solvedMethod() == False:  ##the actual setting of the cell
            possibleValues = choiceElement.returnPossible()
            finalValue = random.choice(possibleValues)
            choiceElement.setAnswer(finalValue)
            for i in cells:  ##now we iterate through the remaining unset cells and remove the input if it's in the same row, col, or box
                position2 = sudoku[i].checkPosition()
                if position1[0] == position2[0]:
                    sudoku[i].remove(finalValue)
                if position1[1] == position2[1]:
                    sudoku[i].remove(finalValue)
                if position1[2] == position2[2]:
                    sudoku[i].remove(finalValue)

        else:
            finalValue = choiceElement.returnSolved()
            for i in cells:  ##now we iterate through the remaining unset cells and remove the input if it's in the same row, col, or box
                position2 = sudoku[i].checkPosition()
                if position1[0] == position2[0]:
                    sudoku[i].remove(finalValue)
                if position1[1] == position2[1]:
                    sudoku[i].remove(finalValue)
                if position1[2] == position2[2]:
                    sudoku[i].remove(finalValue)
    return sudoku

def sudokuChecker(sudoku):
    """ Checks to see if an input a completed sudoku puzzle is of the correct format and abides by all
        of the rules of a sudoku puzzle. Returns True if the puzzle is correct. False if otherwise"""
    for i in range(len(sudoku)):
        for n in range(len(sudoku)):
            if i != n:
                position1 = sudoku[i].checkPosition()
                position2 = sudoku[n].checkPosition()
                if position1[0] == position2[0] or position1[1] == position2[1] or position1[2] == position2[2]:
                    num1 = sudoku[i].returnSolved()
                    num2 = sudoku[n].returnSolved()
                    if num1 == num2:
                        return False
    return True

def perfectSudoku():
    result = False
    while result == False:
        s = sudokuGen()
        result = sudokuChecker(s)
    return s

def solver(sudoku, f = 0):

    if f > 900:
        return False
    guesses = 0
    copy_s = copy.deepcopy(sudoku)
    cells = [i for i in range(81)] ## our cells is the positions of cells not currently set
    solvedCells = []
    for i in cells:
        if copy_s[i].lenOfPossible() == 1:
            solvedCells.append(i)
    while solvedCells != []:
        for n in solvedCells:
            cell = copy_s[n]
            position1 = cell.checkPosition()
            finalValue = copy_s[n].returnSolved()
            for i in cells:  ##now we itterate through the remaing unset cells and remove the input if it's in the same row, col, or box
                position2 = copy_s[i].checkPosition()
                if position1[0] == position2[0]:
                    copy_s[i].remove(finalValue)
                if position1[1] == position2[1]:
                    copy_s[i].remove(finalValue)
                if position1[2] == position2[2]:
                    copy_s[i].remove(finalValue)
                if copy_s[i].lenOfPossible() == 1 and i not in solvedCells and i in cells:
                    solvedCells.append(i)
                ##print(n)
            solvedCells.remove(n)
            cells.remove(n)
        if cells != [] and solvedCells == []:
            lowestNum=[]
            lowest = []
            for i in cells:
                lowestNum.append(copy_s[i].lenOfPossible())
            m = min(lowestNum)
            for i in cells:
                if copy_s[i].lenOfPossible() == m:
                    lowest.append(copy_s[i])
            randomChoice = random.choice(lowest)
            randCell = copy_s.index(randomChoice)
            randGuess = random.choice(copy_s[randCell].returnPossible())
            copy_s[randCell].setAnswer(randGuess)
            solvedCells.append(randCell)
            guesses += 1
    if sudokuChecker(copy_s):
        if guesses == 0:
            level = 'Easy'
        elif guesses <= 2:
            level = 'Medium'
        elif guesses <= 7:
            level = 'Hard'
        else:
            level = 'Insane'
        return copy_s, guesses, level
    else:
        return solver(sudoku, f+1)
    
def solve(sudoku, n = 0):
    if n < 30:
        s = solver(sudoku)
        if s != False:
            return s
        else:
            solve(sudoku, n+1)
    else:
        return False
    
def puzzleGen(sudoku):
    """ Generates a puzzle with a unique solution. """
    cells = [i for i in range(81)]
    while cells != []:
        copy_s = copy.deepcopy(sudoku)
        randIndex = random.choice(cells)
        cells.remove(randIndex)
        copy_s[randIndex].reset()
        s = solve(copy_s)
        if s[0] == False:
            f = solve(sudoku)
            print("Guesses: " + str(f[1]))
            print("Level: " + str(f[2]))
            return printSudoku(sudoku)
        elif equalChecker(s[0],solve(copy_s)[0]):
            if equalChecker(s[0],solve(copy_s)[0]):
                sudoku[randIndex].reset()
        else:
            f = solve(sudoku)
##            print("Guesses: " + str(f[1]))
##            print("Level: " + str(f[2]))
            return sudoku, f[1], f[2]

def equalChecker(s1,s2):
    """ Checks to see if two puzzles are the same"""
    for i in range(len(s1)):
        if s1[i].returnSolved() != s2[i].returnSolved():
            return False
    return True

def main(level):
    """ Input the level of difficulty of the sudoku puzzle. Difficulty levels
        include ‘Easy’ ‘Medium’ ‘Hard’ and ‘Insane’. Outputs a sudoku of desired
        difficulty."""
    t1 = time.time()
    n = 0
    if level == 'Easy':
        p = perfectSudoku()
        s = puzzleGen(p)
        if s[2] != 'Easy':
            return main(level)
        t2 = time.time()
        t3 = t2 - t1
        return printSudoku(s[0])
    if level == 'Medium':
        p = perfectSudoku()
        s = puzzleGen(p)
        while s[2] == 'Easy':
            n += 1
            s = puzzleGen(p)
            if n > 50:
                return main(level)
        if s[2] != 'Medium':
            return main(level)
        t2 = time.time()
        t3 = t2 - t1
        return printSudoku(s[0])
    if level == 'Hard':
        p = perfectSudoku()
        s = puzzleGen(p)
        while s[2] == 'Easy':
            n += 1
            s = puzzleGen(p)
            if n > 50:
                return main(level)
        while s[2] == 'Medium':
            n += 1
            s = puzzleGen(p)
            if n > 50:
                return main(level)
        if s[2] != 'Hard':
            return main(level)
        t2 = time.time()
        t3 = t2 - t1
        return printSudoku(s[0])
    if level == 'Insane':
        p = perfectSudoku()
        s = puzzleGen(p)
        while s[2] != 'Insane':
            n += 1
            s = puzzleGen(p)
            if n > 50:
                return main(level)
        t2 = time.time()
        t3 = t2 - t1
        return printSudoku(s[0])
    else:
        raise(ValueError)



if __name__ == "__main__":
    app.run(debug=True)