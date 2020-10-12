
def moneyAdd(numbers):
    total = 0
    for n in numbers:
        total = total + n
    return round(total, 2)

# ---- Test Functions -----------------------

def test_moneyAdd():
    values_to_add = [12.03, 12.04, 6.04]
    result = moneyAdd(values_to_add)
    print(result)

test_moneyAdd()
