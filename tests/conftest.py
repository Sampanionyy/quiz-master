import copy

import pytest

from app.app import app as flask_app
from data import mocks

_ORIGINAL_STUDENTS = copy.deepcopy(mocks.students)
_ORIGINAL_SUBJECTS = copy.deepcopy(mocks.subjects)
_ORIGINAL_STUDENTS_SUBJECTS = copy.deepcopy(mocks.students_subjects)


@pytest.fixture(autouse=True)
def reset_mock_data():
    """Restore in-memory mock data before each test since routes mutate it directly."""
    mocks.students[:] = copy.deepcopy(_ORIGINAL_STUDENTS)
    mocks.subjects[:] = copy.deepcopy(_ORIGINAL_SUBJECTS)
    mocks.students_subjects[:] = copy.deepcopy(_ORIGINAL_STUDENTS_SUBJECTS)
    yield


@pytest.fixture
def app():
    flask_app.config["TESTING"] = True
    return flask_app


@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client
