from typing import List
def max_subarray_sum(arr: List[int]) -> int:
    """
    You are given an array `arr` of `n` integers. Your task is to find the maximum
    sum of a contiguous subarray within the array. The subarray must contain at
    least one element. As a reminder, your code has to be in python
    """
    if not arr:
        return 0
    max_current = max_global = arr[0]
    for i in range(1, len(arr)):
        max_current = max(arr[i], max_current + arr[i])
        if max_current > max_global:
            max_global = max_current
    return max_global