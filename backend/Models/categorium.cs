using System;
using System.Collections.Generic;

namespace backend.api.Models;

public partial class categorium
{
    public int id { get; set; }

    public string nombre { get; set; } = null!;

    public int? id_categoria { get; set; }

    public virtual ICollection<categorium> Inverseid_categoriaNavigation { get; set; } = new List<categorium>();

    public virtual categorium? id_categoriaNavigation { get; set; }

    public virtual ICollection<producto> id_productos { get; set; } = new List<producto>();

    public virtual ICollection<servicio> id_servicios { get; set; } = new List<servicio>();
}
