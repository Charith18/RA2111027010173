import requests
from flask import Flask, jsonify

app = Flask(__name__)

WINDOW_SIZE = 10
stored_numbers = []

def fetch_numbers():
    response = requests.get('https://api.example.com/numbers')  # Assuming the third-party API endpoint
    if response.status_code == 200:
        return response.json().get('numbers', [])
    return []

def calculate_average(numbers):
    if len(numbers) == 0:
        return 0
    return sum(numbers) / len(numbers)

@app.route('/numbers/<numberid>')
def get_numbers(numberid):
    global stored_numbers

    if numberid not in ['p', 'f', 'e', 'r']:
        return jsonify({'error': 'Invalid number ID'}), 400

    numbers_from_third_party = fetch_numbers()
    if not numbers_from_third_party:
        return jsonify({'error': 'Failed to fetch numbers from third-party server'}), 500

    new_numbers = [num for num in numbers_from_third_party if num not in stored_numbers]
    stored_numbers = new_numbers[:WINDOW_SIZE] + stored_numbers[:WINDOW_SIZE - len(new_numbers)]

    window_prev_state = stored_numbers[:WINDOW_SIZE]
    window_curr_state = stored_numbers[-WINDOW_SIZE:]
    avg = calculate_average(window_curr_state)

    response_data = {
        "windowPrevState": window_prev_state,
        "windowCurrState": window_curr_state,
        "numbers": window_curr_state,  # Assuming all fetched numbers are considered
        "avg": "{:.2f}".format(avg)
    }
    return jsonify(response_data)

if __name__ == '__main__':
    app.run(debug=True)
