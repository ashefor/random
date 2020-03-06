declare var swal: any;
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Status } from '../../../interfaces/status';
import { Title } from '@angular/platform-browser';
import { Survey, Question, Choice } from '../../../interfaces/survey';
import { CacheService } from 'src/app/services/cache.service';
import { ToastrService } from 'ngx-toastr';
import { SurveyService } from 'src/app/services/survey.service';
import { DataHandlerService } from 'src/app/services/data.service';
import { StoreTypeService } from 'src/app/services/store-type.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-survey',
  templateUrl: './survey.component.html',
  styleUrls: ['./survey.component.css']
})
export class SurveyComponent implements OnInit {
  title: string;
  mode: any;
  modes: any;
  statuses: Array<Status>;
  surveys: Array<any>;
  storeTypes: Array<any>;

  sorted: Array<any>;
  queryArray: Array<any>;
  sortOption: any;
  query = '';

  p = 1;
  p1 = 1;

  user_id: string;
  manufacturer_id: string;

  modeWatch: Observable<number>;

  qTypes = [
    { name: 'Single answer', value: 'question'},
    { name: 'Multiple choice', value: 'multiple-choice'}
  ];
  createChoicesTransveralObject = {
    findChoicesArray: function(choicesArray, questionId) {
      console.log(choicesArray);
      return choicesArray.filter((choices) => {
        return choices.qid === questionId;
      }).sort(function(a, b) {
        const A = a.index, B = b.index;
        if (A < B) {
          return -1;
        }
        if (A > B) {
          return 1;
        }
        return 0;
      });
    }
  };

  createSurvey: Survey;
  editSurvey: Survey;

  currentSurvey: any;
  currentSurveyQs: any;

  createQ: Question;
  createChoices: Array<Choice> = [];

  editQ: Question;
  editChoices: Array<any> = [];
  currentQ: any;

  createImage: any;
  editImage: any;
  createSrc: any;
  editSrc: any;

  createSurveyImage: any;
  editSurveyImage: any;
  createSurveySrc: any;
  editSurveySrc: any;

  constructor(title: Title, private survey: SurveyService, private cache: CacheService, private toastr: ToastrService,
    dataHandler: DataHandlerService, private store: StoreTypeService) {
    this.title = 'Surveys';
    title.setTitle('Suplias - Surveys');
    this.modes = ['view', 'add', 'edit', 'viewQ', 'addQ', 'editQ'];
    this.mode = this.modes[0];
    this.modeWatch = of(0);
    this.statuses = [
      { name: 'Active', value: 'active'},
      { name: 'Inactive', value: 'inactive'},
    ];
    this.manufacturer_id = JSON.parse(dataHandler.getUserData().manufacturer)._id;
    this.user_id = dataHandler.getUserData()._id;
  }

  ngOnInit() {
    this.cache.surveys.subscribe((value) => {
      this.sorted = value;
      this.surveys = value;
    });
    this.fetchSurveys();
    this.editSurvey = { description: '', status: 'inactive', title: '', store_type: 'select', user_id: this.user_id,
      manufacturer_id: this.manufacturer_id, reward_points: 0, reward_wallet: 0 };
  }

  setMode(index: number) {
    this.mode = this.modes[index];
    this.modeWatch = of(index);
    if (index === 1 || index === 2) {
      this.fetchStoreTypes();
      this.createSurvey = { description: '', status: 'inactive', title: '', store_type: 'select', user_id: this.user_id,
        manufacturer_id: this.manufacturer_id, reward_points: 0, reward_wallet: 0 };
    }
  }

  spawnEdit(survey) {
    this.editSurvey.description = survey.description;
    this.editSurvey.status = survey.status;
    this.editSurvey.store_type = survey.store_type;
    this.editSurvey.title = survey.title;
    this.editSurvey.user_id = survey.user_id;
    this.editSurvey.manufacturer_id = survey.manufacturer_id;
    this.editSurvey.reward_wallet = survey.reward_wallet || 0;
    this.editSurvey.reward_points = survey.reward_points || 0;
    this.editSurveySrc = survey.image;
    this.editSurveyImage = null;
    this.currentSurvey = survey;
    this.setMode(2);
  }

  closeCreate() {
    this.resetForms();
    this.setMode(0);
  }

  resetForms() {
    this.createSurvey = { description: '', status: 'select', title: '', store_type: 'select', user_id: this.user_id,
      manufacturer_id: this.manufacturer_id, reward_wallet: 0, reward_points: 0 };
    this.editSurvey = { description: '', status: 'select', title: '', store_type: 'select', user_id: this.user_id,
      manufacturer_id: this.manufacturer_id, reward_wallet: 0, reward_points: 0 };
    this.currentSurvey = null;
    this.editSurveyImage = null;
    this.editSurveySrc = null;
    this.createSurveyImage = null;
    this.createSurveySrc = null;
  }

  createAction() {
    this.createSurvey.reward_points === null ? this.createSurvey.reward_points = 0 :
      this.createSurvey.reward_points = this.createSurvey.reward_points;
    this.createSurvey.reward_wallet === null ? this.createSurvey.reward_wallet = 0 :
      this.createSurvey.reward_wallet = this.createSurvey.reward_wallet;

    this.survey.create(this.createSurvey, this.createSurveyImage).then(() => {
      this.fetchSurveys();
      this.toastr.success('Survey created. Survey is inactive, remember to activate after adding survey questions.');
      this.closeCreate();
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  spawnDelete(id) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.survey.delete(id).then(() => {
          this.closeCreate();
          this.fetchSurveys();
          this.toastr.success('Survey deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  editAction() {
    this.editSurvey.reward_points === null ? this.editSurvey.reward_points = 0 :
      this.editSurvey.reward_points = this.editSurvey.reward_points;
    this.editSurvey.reward_wallet === null ? this.editSurvey.reward_wallet = 0 :
      this.editSurvey.reward_wallet = this.editSurvey.reward_wallet;

    this.survey.edit(this.editSurvey, this.currentSurvey, this.editSurveyImage).then(() => {
      this.fetchSurveys();
      this.toastr.success('Survey edited.');
      this.closeCreate();
    }).catch((error: any) => {
      this.toastr.error(error.message);
    });
  }

  backToSurvey() {
    this.currentSurveyQs = null;
    this.setMode(2);
  }

  spawnQuestionCreate() {
    this.createQ = {
      type: 'select', title: '', index: this.currentSurveyQs.length + 1, status: 'select', survey_id: this.currentSurvey._id
    };
    this.setMode(4);
  }

  spawnChoicesCreate(e) {
    const choice_ = e.srcElement.value, choices = [];
    if (choice_ === 'multiple-choice') {
      for (let i = 0; i < 4; i++) {
        const choice: Choice = { title: '', index: i + 1, status: 'active', question_id: '' };
        choices.push(choice);
        if (i === 3) {
          this.createChoices.push(...choices);
        }
      }
    } else {
      this.createChoices = [];
    }
  }

  loadQuestions() {
    this.setMode(3);
    this.survey.fetchSurveyQs(this.currentSurvey._id).then((questions: Array<any>) => {
      this.currentSurveyQs = questions;
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  closeQuestionCU() {
    this.createQ = {
      type: 'select', title: '', index: this.currentSurveyQs.length + 1, status: 'active', survey_id: this.currentSurvey._id
    };
    this.createChoices = [];
    this.editQ = {
      type: 'select', title: '', index: null, status: 'active', survey_id: this.currentSurvey._id
    };
    this.editChoices = [];
    this.currentQ = null;
    this.setMode(3);
    this.editImage = null;
    this.editSrc = null;
    this.createImage = null;
    this.createSrc = null;
  }

  createQAction() {
    this.createQ.type === this.qTypes[1].value ? this.survey.addQuestion(this.createQ, this.createChoices, this.createImage).then(() => {
      this.closeQuestionCU();
      this.loadQuestions();
      this.toastr.success('Question created');
    }).catch((error) => {
      this.toastr.error(error.message);
    }) : this.survey.addQuestion(this.createQ, null, this.createImage).then(() => {
      this.closeQuestionCU();
      this.loadQuestions();
      this.toastr.success('Question created');
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  editQAction() {
    this.editQ.type === this.qTypes[1].value ? this.survey.editQuestion(this.editQ, this.currentQ, this.editChoices, this.editImage)
      .then(() => {
      this.closeQuestionCU();
      this.loadQuestions();
      this.toastr.success('Question edited');
    }).catch((error) => {
      this.toastr.error(error.message);
    }) : this.survey.editQuestion(this.editQ, this.currentQ, null, this.editImage).then(() => {
      this.closeQuestionCU();
      this.loadQuestions();
      this.toastr.success('Question edited');
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  spawnEditQ(question: any) {
    this.editQ = {
      type: 'select', title: '', index: null, status: 'active', survey_id: this.currentSurvey._id
    };
    this.editQ.type = question.type;
    this.editQ.title = question.title;
    this.editQ.survey_id = question.survey_id;
    this.editQ.status = question.status;
    this.editQ.index = question.index;
    this.editChoices = question.choices;
    this.currentQ = question;
    this.editSrc = question.image;
    this.editImage = null;
    this.setMode(5);
  }

  spawnDeleteQ(id: string, survey_id: string) {
    swal('Are you sure?', {
      icon: 'warning',
      buttons: [true, true],
      dangerMode: true
    }).then((willDelete) => {
      if (willDelete) {
        this.survey.deleteQuestion(id, survey_id).then(() => {
          this.closeQuestionCU();
          this.loadQuestions();
          this.toastr.success('Question deleted');
        }).catch((error: any) => {
          this.toastr.error(error.message);
        });
      }
    });
  }

  validateEditQuestion () {
    return this.validateEditQuestionFragment() === true && this.validateEditOptionsFragment() === true;
  }

  validateEditQuestionFragment() {
    return this.editQ.type !== 'select' && this.editQ.title !== '' && this.editQ.index !== null && this.editQ.status !== 'select' &&
      this.editQ.survey_id !== '';
  }

  validateEditOptionsFragment() {
    if (this.editQ.type === this.qTypes[0].value) {
      return true;
    } else {
      const incomplete = this.createChoices.filter((choice) => {
        return choice.title === '';
      });
      if (incomplete.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  validateCreateQuestion () {
    return this.validateCreateQuestionFragment() === true && this.validateCreateOptionsFragment() === true;
  }

  validateCreateQuestionFragment() {
    return this.createQ.type !== 'select' && this.createQ.title !== '' && this.createQ.index !== null && this.createQ.status !== 'select' &&
      this.createQ.survey_id !== '';
  }

  validateCreateOptionsFragment() {
    if (this.createQ.type === this.qTypes[0].value) {
      return true;
    } else {
      const incomplete = this.createChoices.filter((choice) => {
        return choice.title === '';
      });
      if (incomplete.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }

  validateCreateSurvey() {
    const [title, description, store_type, status, user_id, manufacturer_id] = [
      this.createSurvey.title, this.createSurvey.description, this.createSurvey.store_type,
      this.createSurvey.status, this.createSurvey.user_id, this.createSurvey.manufacturer_id
    ];
    return (title !== '' && description !== '' && store_type !== 'select' && status !== 'select' && user_id !== '' &&
      manufacturer_id !== '');
  }

  validateEditSurvey() {
    const [title, description, store_type, status, user_id, manufacturer_id] = [
      this.editSurvey.title, this.editSurvey.description, this.editSurvey.store_type,
      this.editSurvey.status, this.editSurvey.user_id, this.editSurvey.manufacturer_id
    ];
    return (title !== '' && description !== '' && store_type !== 'select' && status !== 'select' && user_id !== '' &&
      manufacturer_id !== '');
  }

  fetchSurveys() {
    this.survey.fetchAll(this.manufacturer_id).then(() => { }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  search() {
    let searchPool = this.surveys;
    if (this.sortOption !== 'none') {
      searchPool = this.sorted;
    }

    // set G to the value of the search bar
    const q = this.query;

    // if value is empty, don't filter items
    if (!q) {
      return;
    }

    this.queryArray = searchPool.filter((v) => {
      if (v.name && q) {
        if ( v.title.toLowerCase().indexOf(q.toLowerCase()) > -1) {
          return true;
        }
        return false;
      }
    });
  }

  sort(e) {
    const val = e.srcElement.value;
    switch (val) {
      case 'all':
        this.sorted = this.surveys;
        this.sortOption = 'none';
        break;
      case 'active':
        this.sorted = this.surveys.filter((item) => {
          return item.status === 'active';
        }).sort(function(a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'active';
        break;
      case 'inactive':
        this.sorted = this.surveys.filter((item) => {
          return item.status === 'inactive';
        }).sort(function(a, b) {
          const A = a.title.toLowerCase(), B = b.title.toLowerCase();
          if (A < B) {
            return -1;
          }
          if (A > B) {
            return 1;
          }
          return 0;
        });
        this.sortOption = 'inactive';
        break;

      default:
        this.sorted = this.surveys;
        break;
    }
  }

  fetchStoreTypes() {
    this.store.fetch().then((stores: Array<any>) => {
      this.storeTypes = stores;
    }).catch((error) => {
      this.toastr.error(error.message);
    });
  }

  preview(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only image files are supported');
      return;
    }

    const reader = new FileReader();

    switch (this.mode) {
      case this.modes[4]:
        this.createImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.createSrc = reader.result;
            }
          };
        };
        break;

      case this.modes[5]:
        this.editImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.editSrc = reader.result;
            }
          };
        };
        break;
      default:
        break;
    }
  }

  uploadFile() {
    const fileInput = document.getElementById('files');
    fileInput.click();
  }

  removeImage(type) {
    (<HTMLInputElement>document.getElementById('files')).value = '';
    if (type === 'create') {
      this.createImage = null;
      this.createSrc = null;
    }
    if (type === 'edit') {
      this.editImage = null;
      this.editSrc = null;
    }
  }

  showImage(img_id: string) {
    const img = document.getElementById(img_id);
    img.click();
  }

  previewSurvey(e) {
    const files = e.target.files || e.dataTransfer.files;
    if (files.length === 0) {
      return;
    }
    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.toastr.error('Only image files are supported');
      return;
    }

    const reader = new FileReader();

    switch (this.mode) {
      case this.modes[1]:
        this.createSurveyImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.createSurveySrc = reader.result;
            }
          };
        };
        break;

      case this.modes[2]:
        this.editSurveyImage = files[0];
        reader.readAsDataURL(files[0]);
        reader.onload = (_event) => {
          const image = new Image();
          image.src = String(reader.result);
          const context = this;
          image.onload = function() {
            const [ height, weight ] = [ image.naturalHeight, image.naturalWidth ];
            if (height < 180 || weight < 180) {
              context.toastr.error('Image aspect ratio should be at least 180 x 180');
              return false;
            } else {
              context.editSurveySrc = reader.result;
            }
          };
        };
        break;
      default:
        break;
    }
  }

  removeSurveyImage(type) {
    (<HTMLInputElement>document.getElementById('files')).value = '';
    if (type === 'create') {
      this.createSurveyImage = null;
      this.createSurveySrc = null;
    }
    if (type === 'edit') {
      this.editSurveyImage = null;
      this.editSurveySrc = null;
    }
  }
}
