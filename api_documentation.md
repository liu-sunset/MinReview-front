# 小众点评项目接口文档

## 接口说明

- **Base URL**: `http://localhost:8080`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token (Header: `Authorization: Bearer <token>`)

## 通用响应格式

```json
{
    "code": 1,           // 状态码: 1表示成功，0表示错误
    "msg": "success",  // 响应消息，success表示成功，error表示错误
    "data": {}           // 响应数据
}
```

## 1. 用户端接口

### 1.1 用户认证

#### 1.1.1 用户登录
- **URL**: `/user/login`
- **Method**: `POST`
- **Request Body**:
```json
{
    "name": "zhangsan",
    "password": "123456"
}
```
- **Response**:
```json
{
    "code": 1,
    "msg": "登录成功",
    "data": {
        "token": "jwtToken",
        "userInfo": {
            "id": 1,
            "name": "用户名",
            "avatarUrl": "头像URL",
            "phone": "137445588994",
            "gender": 1,
            "createTime": "2024-01-01 12:00:00"
        }
    }
}
```

#### 1.1.2 获取用户信息（展示个人信息主页）

- **URL**: `/user/personInfo?id=1`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "id": 1,
        "name": "用户昵称",
        "avatarUrl": "头像URL",
        "gender": 1,
        "phone": "13726800569",
        "createTime": "2024-01-01 12:00:00"
    }
}
```

#### 1.1.3 更新用户信息 
- **URL**: `/user/personInfo`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "id": 1,
    "name": "新昵称",
    "phone": "13726800569",
    "avatarUrl": "新头像URL",
    "gender": 2
}
```

* **Response样例**

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.1.4 注销账号 

- **URL**: `/user/personInfo?id=1`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.1.5 注册账号 

- **URL**: `/user/register`

- **Method**: `post`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "name": "zhangsan",
      "password": "123456"
  }
  ```

* **Response样例**：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```


#### 1.1.6 修改账号密码 

- **URL**: `/user/password/{userId}`

- **Method**: `post`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "oldPassword": "123456",
      "newPassword": "234567"
  }
  ```


#### 1.1.7 用户登出 

- **URL**: `/user/logout`

- **Method**: `post`

- **Headers**: `Authorization: Bearer <token>`

- **Response**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  



### 1.2 校区管理 

#### 1.2.1 获取校区列表
- **URL**: `/user/campus/list`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": [
        {
            "id": 1,
            "name": "主校区",
            "address": "校区地址",
            "status": 1
        }
    ]
}
```

### 1.3 食堂管理 

#### 1.3.1 根据校区获取食堂列表
- **URL**: `/user/canteen/list/{campusId}`
- **Method**: `GET`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": [
        {
            "id": 1,
            "name": "第一食堂",
            "campusId": 1,
            "campusName": "主校区",
            "address": "食堂地址",
            "status": 1,
            "floorCount": 3  // 楼层数量
        }
    ]
}
```

### 1.4 楼层管理 

#### 1.4.1 根据食堂获取楼层列表
- **URL**: `/user/floor/list/{canteenId}`
- **Method**: `GET`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": [
        {
            "id": 1,
            "name": "一楼",
            "canteenId": 1,
            "canteenName": "第一食堂",
            "floorNumber": 1,
            "description": "楼层描述",
            "dishCount": 20  // 菜品数量
        }
    ]
}
```

### 1.5 菜品管理 

#### 1.5.1 根据楼层、校区ID和食堂ID获取菜品列表
- **URL**: `/user/dish/list`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
  - `keyword`: 搜索关键词（可选）
  - `canteenId`:食堂ID（选填）
  - `campusId`:校区ID（选填）
  - `categoryId`:分类ID（选填）
  - `floorId`:楼层ID（选填）
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "total": 50,
        "list": [
            {
                "id": 1,
                "name": "宫保鸡丁",
                "description": "菜品描述",
                "price": 12.00,
                "imageUrl": "菜品图片URL",
                "categoryId": 1,
                "categoryName": "热菜",
                "floorId": 1,
                "floorName": "一楼",
                "canteenId": 1,
                "canteenName": "北京大学学一食堂",
                "campusId": 1,
                "campusName": "北京大学",
                "likeCount": 100,    // 点赞数
                "dislikeCount": 5,   // 点踩数
                "commentCount": 20,  // 评论数
                "status": 1,
                "updateTime": "2024-01-01 12:00:00"
            }
        ]
    }
}
```

#### 1.5.2 获取菜品详情
- **URL**: `/user/dish/detail/{dishId}`
- **Method**: `GET`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "id": 1,
        "name": "宫保鸡丁",
        "description": "菜品描述",
        "price": 12.00,
        "imageUrl": "菜品图片URL",
        "categoryId": 1,
        "categoryName": "热菜",
        "floorId": 1,
        "floorName": "一楼",
        "canteenId": 1,
        "canteenName": "第一食堂",
        "campusId": 1
        "campusName": "主校区",
        "likeCount": 100,
        "dislikeCount": 5,
        "commentCount": 20,
        "status": 1,
        "updateTime": "2024-01-01 12:00:00"
    }
}
```

### 1.6 点赞/点踩管理 

#### 1.6.1 点赞菜品
- **URL**: `/user/like`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "dishId": 1,
    "userId": 1
}
```

* **Response样例**：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.6.2 取消点赞

- **URL**: `/user/like/{dishId}/{userId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.6.3 点踩菜品
- **URL**: `/user/dislike`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "dishId": 1,
    "userId": 1
}
```

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.6.4 取消点踩

- **URL**: `/user/dislike/{dishId}/{userId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 1.7 评论管理 

#### 1.7.1 获取菜品评论列表
- **URL**: `/user/comment/list`
- **Method**: `GET`
- **Query Parameters**:
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
  - `dishId`：菜品ID
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "total": 20,
        "list": [
            {
                "id": 1,
                "content": "评论内容",
                "dishId": 1,
                "userId": 1,
                "status": 1,
                "name": "用户昵称",
                "likeCount": 20,
                "avatarUrl": "用户头像",
                "updateTime": "2024-01-01 12:00:00"
            }
        ]
    }
}
```

#### 1.7.2 发布评论
- **URL**: `/user/comment`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "dishId": 1,
    "userId": 1,
    "content": "评论内容，不超过200字符",
    "avatarUrl": "https://example.jpg",
    "userName": "张三"
}
```

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 1.7.3 删除评论

- **URL**: `/user/comment/{commentId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```


### 1.8 AI聊天接口

- **URL**: `/user/ai`

- **Method**: `POST`

- **Headers**: `Authorization: Bearer <token>`

- **Request:**

  ```json
  {
  	"memoryId": "3745698455",//当前时间戳
  	"message": "用户问题"
  }
  ```

  

- **Response:**后端采用了流式输出，produce是text/html，utf-8编码

## 2. 管理端接口

### 2.1 管理员认证

#### 2.1.1 管理员登录 
- **URL**: `/admin/login`
- **Method**: `POST`
- **Request Body**:
```json
{
    "username": "admin",
    "password": "password"
}
```
- **Response**:
```json
{
    "code": 1,
    "msg": "登录成功",
    "data": {
        "token": "jwt_token_string",
         "id": 1,
         "username": "admin",
         "name": "管理员"
    }
}
```

### 2.2 用户管理 

#### 2.2.1 获取用户列表
- **URL**: `/admin/user/list`

- **Method**: `GET`

- **Headers**: `Authorization: Bearer <token>`

- **Query Parameters**:
  
  - `page`: 页码（默认1）
  
  - `size`: 每页大小（默认10）
  
  - `keyword`: 搜索关键词（可选）
  
  - Response:
  
    ```json
    {
        "code": 1,
        "msg": "success",
        "data": {
            "total": 1,
            "list": [
                {
                    "id": 4,
                    "name": "赵六",
                    "avatarUrl": "https://example.com/avatar4.jpg",
                    "gender": 1,
                    "status": 1,
                    "phone": "13600136000",
                    "updateTime": "2025-08-17 10:36:02"
                }
            ]
        }
    }
    ```
    
    

#### 2.2.2 更新用户状态
- **URL**: `/admin/user/status/{userId}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "status": 0  // 0-禁用, 1-启用
}
```

#### 2.2.3 删除用户
- **URL**: `/admin/user/{userId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.3 校区管理 

#### 2.3.1 获取校区列表
- **URL**: `/admin/campus/list`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
  - `keyword`: 搜索关键词（可选）
  - Response:
  
  ```json 
  {
      "code": 1,
      "msg": "success",
      "data": 
      	"total": 20,
      	"list":
                  [
                      {
                      "id": 1,
                      "name": "主校区",
                      "address": "校区地址",
                      "status": 1,
                      "canteenCount": 5  // 食堂数量
                  	}
                  ]
  }
  ```
  
  

#### 2.3.2 添加校区
- **URL**: `/admin/campus`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "name": "校区名称",
    "address": "校区地址",
    "description": "校区描述"
}
```

* **Response**样例:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.3.3 更新校区

- **URL**: `/admin/campus/{campusId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**: 

  ```json
  {
      "name": "校区名称",
      "address": "校区地址",
      "description": "校区描述"
  }
  ```

  

* **Response样例**：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.3.4 删除校区

- **URL**: `/admin/campus/{campusId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.3.4更新校区状态

- **URL**: `/admin/campus/status/{campusId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "status": 0  // 0-禁用, 1-启用
  }
  ```


* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.4 食堂管理 

#### 2.4.1 获取食堂列表
- **URL**: `/admin/canteen/list`

- **Method**: `GET`

- **Headers**: `Authorization: Bearer <token>`

- **Query Parameters**:
  
  - `page`: 页码（默认1）
  
  - `size`: 每页大小（默认10）
  
  - `keyword`: 搜索关键词（可选）
  
  - `campusId`: 校区ID筛选（可选）
  
  - Response:
  
    ```json
    {
        "code": 1,
        "msg": "success",
        "data": 
        	"total": 50,
        	"list":
                    [
                        {
                            "id": 1,
                            "name": "第一食堂",
                            "campusId": 1,
                            "campusName": "主校区",
                            "address": "食堂地址",
                            "status": 1,
                            "floorCount": 3  // 楼层数量
                        }
                    ]
    }
    ```
    
    

#### 2.4.2 添加食堂
- **URL**: `/admin/canteen`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "name": "食堂名称",
    "campusId": 1,
    "address": "食堂地址",
    "description": "食堂描述"
}
```

* **Response**样例：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.4.3 更新食堂

- **URL**: `/admin/canteen/{canteenId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- `**Request Body**：

  ```json
  {
      "name": "食堂名称",
      "address": "食堂地址",
      "description": "食堂描述"
  }
  ```

  

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.4.4 删除食堂

- **URL**: `/admin/canteen/{canteenId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response**样例:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.3.4更新校区状态

- **URL**: `/admin/canteen/status/{canteenId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "status": 0  // 0-禁用, 1-启用
  }
  ```

  

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.5 楼层管理 

#### 2.5.1 获取楼层列表
- **URL**: `/admin/floor/list`

- **Method**: `GET`

- **Headers**: `Authorization: Bearer <token>`

- **Query Parameters**:
  
  - `page`: 页码（默认1）
  
  - `size`: 每页大小（默认10）
  
  - `keyWord:`楼层名称（可选）
  
  - `canteenId`: 食堂ID筛选（可选）
  
  - Response:
  
    ```json
    {
        "code": 1,
        "msg": "success",
        "data": 
        	"total": 50,
        	"list": 
                    [
                        {
                            "id": 1,
                            "name": "一楼",
                            "canteenId": 1,
                            "canteenName": "第一食堂",
                            "floorNumber": 1,
                            "description": "楼层描述",
                            "dishCount": 20  // 菜品数量
                        }
                    ]
    }
    ```
    
    

#### 2.5.2 添加楼层
- **URL**: `/admin/floor`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "name": "楼层名称",
    "canteenId": 1,
    "floorNumber": 1,
    "description": "楼层描述"
}
```

* **Response样例**：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.5.3 删除楼层

- **URL**: `/admin/floor/{floorId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.6 菜品管理

#### 2.6.1 获取菜品列表
- **URL**: `/admin/dish/list`

- **Method**: `GET`

- **Headers**: `Authorization: Bearer <token>`

- **Query Parameters**:
  - `page`: 页码（默认1）
  
  - `size`: 每页大小（默认10）
  
  - `keyword`: 搜索关键词（可选）
  
  - `floorId`: 楼层ID筛选（可选）
  
  - `categoryId`: 分类筛选（可选）
  
  - `canteenId`:餐厅ID（可选）
  
  - `campusId`: 校区ID（可选）
  
  - Response:
  
    ```json
    {
        "code": 1,
        "msg": "success",
        "data": {
            "total": 50,
            "list": [
                {
                    "id": 1,
                    "name": "宫保鸡丁",
                    "description": "菜品描述",
                    "price": 12.00,
                    "imageUrl": "菜品图片URL",
                    "categoryId": 1,
                    "categoryName": "热菜",
                    "floorId": 1,
                    "floorName": "一楼",
                    "canteenId": 1,
                    "canteenName": "北京大学学一食堂",
                    "campusId": 1,
                    "campusName": "北京大学",
                    "likeCount": 100,    // 点赞数
                    "dislikeCount": 5,   // 点踩数
                    "commentCount": 20,  // 评论数
                    "status": 1,
                    "updateTime": "2024-01-01 12:00:00"
                }
            ]
        }
    }
    ```
    
    

#### 2.6.2 添加菜品
- **URL**: `/admin/dish`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "name": "菜品名称",
    "description": "菜品描述",
    "price": 12.00,
    "imageUrl": "菜品图片URL",
    "categoryId": 1,
    "floorId": 1,
    "canteenId": 1,
    "campusId": 1
}
```

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.6.3 更新菜品

- **URL**: `/admin/dish/{dishId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "name": "菜品名称",
      "description": "菜品描述",
      "price": 12.00,
      "imageUrl": "菜品图片URL",
      "categoryId": 1,
      "floorId": 1,
      "canteenId": 2,
      "campusId": 2
  }
  ```
  
  

* **Response样例**：

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.6.4 删除菜品

- **URL**: `/admin/dish/{dishId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.6.5 更新菜品状态

- **URL**: `/admin/dish/status/{dishId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json 
  {
      "status": 0  // 0-禁用, 1-启用
  }
  ```

* **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.7 评论管理

#### 2.7.1 获取评论列表
- **URL**: `/admin/comment/list`

- **Method**: `GET`

- **Headers**: `Authorization: Bearer <token>`

- **Query Parameters**:
  
  - `page`: 页码（默认1）
  
  - `size`: 每页大小（默认10）
  
  - `dishId`: 菜品ID筛选（必选）
  
  - Response:
  
    ```json
    {
        "code": 1,
        "msg": "success",
        "data": {
            "total": 3,
            "list": [
                {
                    "id": 1,
                    "userId": 1,
                    "dishId": 1,
                    "content": "宫保鸡丁味道很好，很正宗！",
                    "status": 1,
                    "likeCount": 20,
                    "name": "张三",
                    "avatarUrl": "https://example.com/avatar1.jpg",
                    "updateTime": "2025-08-17 10:36:25"
                },
                {
                    "id": 2,
                    "userId": 2,
                    "dishId": 1,
                    "content": "鸡肉很嫩，花生很脆，不错！",
                    "status": 1,
                    "likeCount": 15,
                    "name": "李四",
                    "avatarUrl": "https://example.com/avatar2.jpg",
                    "updateTime": "2025-08-17 10:36:25"
                },
                {
                    "id": 9,
                    "userId": 2,
                    "dishId": 1,
                    "content": "同意楼上的观点，确实很好吃！",
                    "status": 1,
                    "likeCount": 5,
                    "name": "李四",
                    "avatarUrl": "https://example.com/avatar2.jpg",
                    "updateTime": "2025-08-17 10:36:25"
                }
            ]
        }
    }
    ```
    
    

#### 2.7.2 删除评论
- **URL**: `/admin/comment/{commentId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.8 数据统计

#### 2.8.1 获取仪表盘数据
- **URL**: `/admin/stats/dashboard`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": {
        "totalUsers": 1000,     // 总用户数
        "totalDishes": 200,     // 总菜品数
        "totalComments": 5000,  // 总评论数
        "totalLikes": 10000,    // 总点赞数
        "todayNewUsers": 10,    // 今日新增用户
        "todayNewComments": 50,    // 今日新增评论
        "todayNewLikes": 200       // 今日新增点赞
    }
}
```

#### 2.8.2 获取每周点赞统计
- **URL**: `/admin/stats/weekly-likes`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": [
        {
            "date": "2024-01-01",
            "count": 100
        },
        {
            "date": "2024-01-02",
            "count": 120
        }
    ]
}
```

#### 2.8.3 获取每周点踩统计
- **URL**: `/admin/stats/weekly-dislikes`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 同每周点赞统计格式

#### 2.8.4 获取每周评论统计
- **URL**: `/admin/stats/weekly-comments`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: 同每周点赞统计格式

### 2.9 管理员管理

#### 2.9.1 获取管理员列表
- **URL**: `/admin/admin/list`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page`: 页码（默认1）
  - `size`: 每页大小（默认10）
  - `name`:名称
  

* **Response**:

```json
    {
        "code": 1,
        "msg": "success",
        "data": [
            {
                "id": 1,
                "username": "管理员名称",
                "name": "名称",
                "status": 1,
                "updateTime": "2024-01-01 12:00:00"
            }
        ]
    }
```

#### 2.9.2 添加管理员
- **URL**: `/admin/admin`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "username": "admin2",
    "password": "password",
    "name": "管理员2"
}
```

> 前端处理数据不能为空

* **Response**样例:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.9.3 更新管理员名称

- **URL**: `/admin/admin/name/{adminId}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
```json
{
    "name": "新管理员名称"
}
```

* **Response**样例:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.9.4 删除管理员

- **URL**: `/admin/admin/{adminId}`

- **Method**: `DELETE`

- **Headers**: `Authorization: Bearer <token>`

- **Response样例**

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

* **Response**:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

#### 2.9.5 修改管理员状态

- **URL**: `/admin/admin/status/{adminId}/{status}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Response**样例:

```json
{
    "code": 1,
    "msg": "success",
    "data": null
}
```

#### 2.9.6 更新管理员密码

- **URL**: `/admin/admin/password/{adminId}`

- **Method**: `PUT`

- **Headers**: `Authorization: Bearer <token>`

- **Request Body**:

  ```json
  {
      "oldPassword": "123456",
      "newPassword": "234567"
  }
  ```

* **Response**样例:

  ```json
  {
      "code": 1,
      "msg": "success",
      "data": null
  }
  ```

  

### 2.10 文件上传

#### 2.10.1 上传图片
- **URL**: `/admin/file/upload/image`
- **Method**: `POST`
- **Headers**: 
  - `Authorization: Bearer <token>`
  - `Content-Type: multipart/form-data`
- **Request Body**: form-data with file
- **Response**:
```json
{
    "code": 1,
    "msg": "success",
    "data": "/uploads/images/image_20240101_120000.jpg"
}
```

## 3. 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 请求成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填项 |
| 401 | 未认证/Token无效 | 重新登录获取有效Token |
| 403 | 无权限访问 | 检查用户权限 |
| 404 | 资源不存在 | 检查请求的资源ID是否正确 |
| 409 | 资源冲突 | 检查是否存在重复数据 |
| 429 | 请求频率限制 | 减少请求频率，稍后重试 |
| 500 | 服务器内部错误 | 联系系统管理员 |

### 具体业务错误码

| 错误码 | 说明 |
|:-------|------|
| 1001 | 用户不存在 |
| 1002 | 用户已被禁用 |
| 1003 | 微信授权失败 |
| 1004 | Token已过期 |
| 1005 | 今日评论次数已达上限 |
| 1006 | 今日已对该菜品点赞/点踩 |
| 1007 | 评论内容超过长度限制 |
| 1008 | 文件格式不支持 |
| 1009 | 文件大小超过限制 |
| 1010 | 管理员用户名已存在 |

## 4. 注意事项

1. **认证Token**: 所有需要认证的接口都需要在Header中携带JWT Token
2. **请求频率**: 部分接口有频率限制，注意控制请求频次
3. **文件上传**: 图片文件大小限制为10MB，支持jpg、png格式
4. **数据验证**: 所有请求参数都会进行严格验证，确保数据安全
5. **错误处理**: 前端需要根据返回的错误码进行相应的错误处理
6. **缓存策略**: 部分数据接口有缓存，更新后可能需要等待缓存刷新