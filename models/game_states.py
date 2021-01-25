"""

"""

import copy
import functools

from utils import permutation


class Error(Exception):
    """Class for exceptions of this module."""

    @classmethod
    def check(cls, condition, *args):
        if not condition:
            raise cls(*args)


@functools.total_ordering  # generates from == and < the other comparison operators
# lexicographic ordering is used
class GameState:

    def __init__(self, rows):
        """ Creates a game state.
            param rows: a list of integers, representing a valid game state. Otherwise Error is raised.
        """
        # Check and convert input
        Error.check(isinstance(rows, list), "rows must be a list", "hahaha")
        Error.check(len(rows) == 5, "rows must have length 5")
        self.rows = []
        for k in range(5):
            x = rows[k]
            Error.check(isinstance(x, int), "rows must contain integers only")
            Error.check(0 <= x <= 5, 'rows must consist of digits in 0..5')
            Error.check(x <= k+1, f"row at index {k} must contain <= {k + 1} matches")
            self.rows.append(x)
        Error.check(sum(self.rows) > 0, 'rows must contain at least 1 match')

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.rows == other.rows
        else:
            return NotImplemented

    def __lt__(self, other):
        if isinstance(other, self.__class__):
            return self.rows < other.rows
        else:
            return NotImplemented

    def get_rows(self):
        """ Returns a copy of the internal rows list
        """
        return copy.deepcopy(self.rows)

    def get_total_count(self):
        """ Returns total count of all matches
        """
        return sum(self.rows)

    def normalize(self):
        """ Sorts the internal rows list and returns the permutation generating this sort order.
        """
        self.rows, p = permutation.Permutation.sorted(self.rows)
        return p

    def is_normalized(self):
        """ Returns True iff the internal rows list ist sorted in ascending order. """
        test_list = [self.rows[k] <= self.rows[k+1] for k in range(4)]
        return all(test_list)

    def denormalize(self, p):
        """ Resets the internal rows list to state before normalization.
            Param p: The permutation that was returned by the call to normalize()
        """
        self.rows = p.inv().apply(self.rows)

    def take(self, count: int, k: int):  # -> GameState:
        """
        Takes count matches off the row with index k and returns the new game state.
        Assumption: 1 <= count <= number of matches at index k
                    and count < total count of matches (handles the case, where all matches are in 1 row)
        """
        assert 0 <= k < 5
        assert 1 <= count <= self.rows[k]
        assert count < sum(self.rows)
        new_rows = self.get_rows()
        new_rows[k] -= count
        return GameState(new_rows)

    def normalized_successors(self) -> list:
        """
        Assumption: self is a normalized game state.
        :return: list of all normalized game states that can be generated from self with 1 move.
        Example: [0, 0, 1, 2, 2] will return [0, 0, 0, 2, 2], [0, 0, 1, 1, 2], [0, 0, 0, 1, 2]
        """
        assert self.is_normalized()
        result = []
        max_count = min(3, sum(self.rows)-1)
        # later a list of lists may be used, therefore this double loop
        for count in range(1, max_count+1):
            temp = []
            for k in range(5):
                if count <= self.rows[k]:
                    game_state = self.take(count, k)
                    game_state.normalize()
                    if game_state not in temp:
                        temp.append(game_state)
            result = result + temp
        return result
