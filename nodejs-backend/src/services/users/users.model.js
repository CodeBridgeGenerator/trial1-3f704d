
    module.exports = function (app) {
        const modelName = "users";
        const mongooseClient = app.get("mongooseClient");
        const { Schema } = mongooseClient;
        const schema = new Schema(
          {
            username: { type:  String , required: true, maxLength: 150, index: true, trim: true, comment: "Username, p, false, true, true, true, true, true, true, , , , ," },
email: { type:  String , maxLength: 150, index: true, trim: true, comment: "Email, p, false, true, true, true, true, true, true, , , , ," },
password: { type:  String , required: true, maxLength: 150, index: true, trim: true, comment: "Password, p, false, true, true, true, true, true, true, , , , ," },

            createdBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
            updatedBy: { type: Schema.Types.ObjectId, ref: "users", required: true },
          }, { timestamps: true });
      
       
        if (mongooseClient.modelNames().includes(modelName)) {
          mongooseClient.deleteModel(modelName);
        }
        return mongooseClient.model(modelName, schema);
        
      };